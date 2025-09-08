const DEFAULT_MODEL = "openai/gpt-oss-120b";
const ORIGIN_KEY = "safebrowseAnalyzedOrigins"; // map: origin -> { verdict, confidence, reason, ts }

async function getSettings() {
	return new Promise((resolve) => {
		chrome.storage.local.get({ enabled: true, groqApiKey: "" }, resolve);
	});
}

async function classifyPage(site) {
	const { groqApiKey } = await getSettings();
	if (!groqApiKey) {
		return { status: "missing_api_key" };
	}

	const compactSite = {
		url: site.url,
		origin: site.origin,
		title: site.title,
		meta: Array.isArray(site.meta) ? site.meta.slice(0, 30) : [],
		links: Array.isArray(site.links) ? site.links.slice(0, 20) : [],
		forms: Array.isArray(site.forms) ? site.forms.slice(0, 5) : [],
		text: typeof site.text === "string" ? site.text.slice(0, 6000) : "",
	};

	const messages = [
		{
			role: "user",
			content:
				"You are a web safety classifier. Given a structured site summary, decide if the site is safe. " +
				"Respond ONLY with strict JSON: {\"is_safe\": boolean, \"confidence\": number 0..1, \"reason\": string <= 160 chars}. " +
				"Consider phishing markers (login capture, credential forms, domain mismatch, suspicious links), scams, and malware.\n\n" +
				"<site_summary>\n" + JSON.stringify(compactSite) + "\n</site_summary>",
		},
		{ role: "assistant", content: "{\"is_safe\":false,\"confidence\":0.0,\"reason\":\"example\"}" },
	];

	async function callGroq(model) {
		const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${groqApiKey}`,
			},
			body: JSON.stringify({
				model,
				messages,
				response_format: { type: "json_object" },
				temperature: 0.2,
				max_tokens: 5000,
			}),
		});
		return response;
	}

	try {
		let response = await callGroq(DEFAULT_MODEL);
		if (!response.ok) {
			let errDetail = "";
			try {
				const ej = await response.json();
				errDetail = ej?.error?.message || JSON.stringify(ej);
			} catch {}
			// Retry with a widely available model if model/params caused 400
			if (response.status === 400) {
				const fallbackModel = "openai/gpt-oss-20b";
				if (DEFAULT_MODEL !== fallbackModel) {
					response = await callGroq(fallbackModel);
					if (!response.ok) {
						let ej2 = null;
						try { ej2 = await response.json(); } catch {}
						return { status: "error", error: `HTTP ${response.status}: ${ej2?.error?.message || errDetail || "Bad Request"}` };
					}
				} else {
					return { status: "error", error: `HTTP ${response.status}: ${errDetail || "Bad Request"}` };
				}
			}
		}

		const data = await response.json();
		const content = data?.choices?.[0]?.message?.content || "{}";
		let parsed;
		try {
			parsed = JSON.parse(content);
		} catch (e) {
			parsed = { verdict: "suspicious", confidence: 0.5, reason: "Non-JSON response" };
		}
		if (Object.prototype.hasOwnProperty.call(parsed, "is_safe")) {
			const isSafe = Boolean(parsed.is_safe);
			const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0.5;
			const reason = typeof parsed.reason === "string" ? parsed.reason.slice(0, 200) : (isSafe ? "Marked safe" : "Marked unsafe");
			const result = { verdict: isSafe ? "safe" : "suspicious", confidence, reason };
			return { status: "ok", result };
		}
		return { status: "ok", result: parsed };
	} catch (err) {
		return { status: "error", error: String(err) };
	}
}

async function getSessionMap() {
	return new Promise((resolve) => {
		chrome.storage.session.get([ORIGIN_KEY], (items) => {
			const raw = items?.[ORIGIN_KEY] || {};
			resolve(raw);
		});
	});
}

async function setSessionMap(map) {
	return new Promise((resolve) => {
		chrome.storage.session.set({ [ORIGIN_KEY]: map }, resolve);
	});
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message?.type === "analyzePage") {
		(async () => {
			const { enabled } = await getSettings();
			if (!enabled) {
				sendResponse({ status: "disabled" });
				return;
			}
			const res = await classifyPage(message.payload);
			sendResponse(res);
		})();
		return true;
	}

	if (message?.type === "getCachedVerdict") {
		(async () => {
			const map = await getSessionMap();
			const cached = map[message.origin] || null;
			sendResponse({ cached });
		})();
		return true;
	}

	if (message?.type === "setCachedVerdict") {
		(async () => {
			const map = await getSessionMap();
			map[message.origin] = {
				verdict: message.result?.verdict,
				confidence: message.result?.confidence,
				reason: message.result?.reason,
				ts: Date.now(),
			};
			await setSessionMap(map);
			sendResponse({ ok: true });
		})();
		return true;
	}
});
