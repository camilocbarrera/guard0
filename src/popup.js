const enabledEl = document.getElementById("enabled");
const keyStatusEl = document.getElementById("keyStatus");
const openOptionsEl = document.getElementById("openOptions");

function get(keys) { return new Promise(r => chrome.storage.local.get(keys, r)); }
function set(items) { return new Promise(r => chrome.storage.local.set(items, r)); }

async function init() {
	const { enabled = true, groqApiKey = "" } = await get(["enabled", "groqApiKey"]);
	enabledEl.checked = Boolean(enabled);
	keyStatusEl.textContent = groqApiKey ? "API key set" : "API key missing";
}

enabledEl.addEventListener("change", async () => {
	await set({ enabled: enabledEl.checked });
});

openOptionsEl.addEventListener("click", () => {
	chrome.runtime.openOptionsPage();
});

init();
