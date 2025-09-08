(() => {
	if (window.__safebrowseInit) return;
	window.__safebrowseInit = true;

	const ORIGIN_KEY = "safebrowseAnalyzedOrigins";
	const indicatorId = "safebrowse-indicator";
	const overlayId = "safebrowse-overlay";

	function createIndicator() {
		if (document.getElementById(indicatorId)) return;
		const el = document.createElement("div");
		el.id = indicatorId;
		el.textContent = "";
		el.title = "Guard0";
		document.documentElement.appendChild(el);
	}

	function setIndicator(state, detail) {
		const el = document.getElementById(indicatorId);
		if (!el) return;
		el.dataset.state = state;
		if (state === "disabled") el.textContent = "⏸";
		else if (state === "missing_key") el.textContent = "🔑";
		else if (state === "analyzing") el.textContent = "…";
		else if (state === "safe") el.textContent = "✓";
		else if (state === "risky") el.textContent = "!";
		else el.textContent = "?";
		if (detail) el.setAttribute("data-detail", detail);
	}

	function showOverlay(kind, message) {
		let ov = document.getElementById(overlayId);
		if (!ov) {
			ov = document.createElement("div");
			ov.id = overlayId;
			ov.innerHTML = `
				<div class="sb-panel">
					<div class="sb-title"></div>
					<p class="sb-reason"></p>
					<div class="sb-actions">
						<button id="sb-dismiss">Proceed anyway</button>
					</div>
				</div>
			`;
			document.documentElement.appendChild(ov);
			ov.querySelector("#sb-dismiss")?.addEventListener("click", () => {
				document.documentElement.classList.remove("sb-blur");
				ov.remove();
			});
		}
		const titleEl = ov.querySelector(".sb-title");
		const reasonEl = ov.querySelector(".sb-reason");
		if (titleEl) titleEl.textContent = kind === "risky" ? "Warning: Potential scam/phishing" : "Analyzing";
		if (reasonEl) reasonEl.textContent = message || "";
		if (kind === "risky") {
			document.documentElement.classList.add("sb-blur");
			ov.style.display = "flex";
		} else if (kind === "hide") {
			ov.style.display = "none";
			document.documentElement.classList.remove("sb-blur");
		} else {
			ov.style.display = "flex";
		}
	}

	function truncate(str, max) {
		if (!str) return "";
		if (str.length <= max) return str;
		return str.slice(0, max);
	}

	function extractLinks(limit) {
		const anchors = Array.from(document.querySelectorAll("a[href]"));
		const out = [];
		for (const a of anchors) {
			if (out.length >= limit) break;
			const href = a.getAttribute("href") || "";
			if (!href || href.startsWith("javascript:")) continue;
			const text = (a.textContent || "").replace(/\s+/g, " ").trim();
			out.push({ href, text: truncate(text, 80) });
		}
		return out;
	}

	function extractForms(limit) {
		const forms = Array.from(document.querySelectorAll("form"));
		const out = [];
		for (const f of forms) {
			if (out.length >= limit) break;
			const action = f.getAttribute("action") || "";
			const method = (f.getAttribute("method") || "GET").toUpperCase();
			const inputs = Array.from(f.querySelectorAll("input,select,textarea"))
				.slice(0, 8)
				.map(el => ({
					tag: el.tagName.toLowerCase(),
					type: (el.getAttribute("type") || "").toLowerCase(),
					name: truncate(el.getAttribute("name") || "", 40),
				}));
			out.push({ action: truncate(action, 200), method, fields: inputs });
		}
		return out.slice(0, limit);
	}

	function extractMeta(limit) {
		const metas = Array.from(document.querySelectorAll("meta[name], meta[property]"))
			.map(m => ({ name: m.getAttribute("name") || m.getAttribute("property"), content: m.getAttribute("content") }))
			.filter(Boolean)
			.slice(0, limit)
			.map(m => ({ name: truncate(m.name || "", 60), content: truncate(m.content || "", 200) }));
		return metas;
	}

	function extractPage() {
		const MAX_TEXT = 6000;
		const url = location.href;
		const origin = location.origin;
		const title = truncate(document.title || "", 200);
		const meta = extractMeta(30);
		const visibleText = document.body ? (document.body.innerText || "").replace(/\s+/g, " ").trim() : "";
		const text = truncate(visibleText, MAX_TEXT);
		const links = extractLinks(20);
		const forms = extractForms(5);
		return { url, origin, title, meta, links, forms, text };
	}

	async function getLocal(keys) {
		return new Promise(resolve => chrome.storage.local.get(keys, resolve));
	}

	function getCachedVerdict() {
		const origin = location.origin;
		return new Promise((resolve) => {
			chrome.runtime.sendMessage({ type: "getCachedVerdict", origin }, (res) => {
				resolve(res?.cached || null);
			});
		});
	}

	function setCachedVerdict(result) {
		const origin = location.origin;
		return new Promise((resolve) => {
			chrome.runtime.sendMessage({ type: "setCachedVerdict", origin, result }, () => resolve());
		});
	}

	function hostnameFrom(url) {
		try { return new URL(url).hostname; } catch { return location.hostname; }
	}

	function isAllowlisted(allowlist, hostname) {
		if (!Array.isArray(allowlist)) return false;
		for (const item of allowlist) {
			const domain = String(item || "").trim().toLowerCase();
			if (!domain) continue;
			if (hostname === domain) return true;
			if (hostname.endsWith("." + domain)) return true;
		}
		return false;
	}

	async function init() {
		createIndicator();
		const { enabled, groqApiKey, allowlist } = await getLocal(["enabled", "groqApiKey", "allowlist"]);
		if (!enabled) {
			setIndicator("disabled");
			return;
		}
		if (!groqApiKey) {
			setIndicator("missing_key");
			return;
		}

		const host = hostnameFrom(location.href).toLowerCase();
		if (isAllowlisted(allowlist, host)) {
			setIndicator("safe");
			return;
		}

		const cached = await getCachedVerdict();
		if (cached) {
			const v = String(cached.verdict || "suspicious").toLowerCase();
			if (v === "safe") {
				setIndicator("safe");
			} else {
				setIndicator("risky");
				showOverlay("risky", cached.reason || "");
			}
			return;
		}

		setIndicator("analyzing");
		showOverlay("analyzing", "Analyzing this site for safety...");
		const payload = extractPage();
		chrome.runtime.sendMessage({ type: "analyzePage", payload }, async (res) => {
			if (!res) {
				setIndicator("error");
				showOverlay("hide");
				return;
			}
			if (res.status === "disabled") {
				setIndicator("disabled");
				showOverlay("hide");
				return;
			}
			if (res.status === "missing_api_key") {
				setIndicator("missing_key");
				showOverlay("hide");
				return;
			}
			if (res.status !== "ok") {
				setIndicator("error");
				showOverlay("hide");
				return;
			}
			const verdict = String(res.result?.verdict || "suspicious").toLowerCase();
			const reason = res.result?.reason || "";
			await setCachedVerdict(res.result);
			if (verdict === "safe") {
				setIndicator("safe");
				showOverlay("hide");
			} else {
				setIndicator("risky");
				showOverlay("risky", reason);
			}
		});
	}

	document.addEventListener("DOMContentLoaded", init);
	if (document.readyState === "interactive" || document.readyState === "complete") {
		init();
	}
})();
