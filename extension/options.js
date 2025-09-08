const enabledEl = document.getElementById("enabled");
const apiKeyEl = document.getElementById("apiKey");
const allowlistEl = document.getElementById("allowlist");
const saveEl = document.getElementById("save");

function get(keys) { return new Promise(r => chrome.storage.local.get(keys, r)); }
function set(items) { return new Promise(r => chrome.storage.local.set(items, r)); }

async function init() {
	const { enabled = true, groqApiKey = "", allowlist = [] } = await get(["enabled", "groqApiKey", "allowlist"]);
	enabledEl.checked = Boolean(enabled);
	apiKeyEl.value = groqApiKey || "";
	allowlistEl.value = Array.isArray(allowlist) ? allowlist.join("\n") : "";
}

saveEl.addEventListener("click", async () => {
	const raw = allowlistEl.value || "";
	const list = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
	await set({ enabled: enabledEl.checked, groqApiKey: apiKeyEl.value.trim(), allowlist: list });
	saveEl.textContent = "Saved";
	setTimeout(() => (saveEl.textContent = "Save"), 1200);
});

init();
