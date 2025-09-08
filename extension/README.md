# Guard0

A tiny web bodyguard that spots scams and phishing in real time using your Groq API key.

## Install

1. Build not required. Open Chrome → `chrome://extensions`.
2. Turn on Developer mode.
3. Click "Load unpacked" and select the `extension` folder in this repo.

## Set up

1. Click the extension icon → Popup → Open Options.
2. Paste your Groq API key and enable protection.

## How it works

- Checks each site once per origin per session—quick and unobtrusive.
- Indicator legend: paused (⏸), missing key (🔑), analyzing (…), safe (✓), risky (!).
- Risky pages get a soft blur and a clear warning, with an option to continue.

## Why Groq

- Simple: OpenAI-style Chat Completions API—small, clear integration.
- Fast: low-latency responses, so checks feel instant.
- Practical: JSON responses and OSS model choices for deterministic UI flows.

## Notes

- Calls `https://api.groq.com/openai/v1/chat/completions` with model `openai/gpt-oss-120b` (falls back to `openai/gpt-oss-20b` on HTTP 400).
- Sends a compact site summary (URL, title, meta, top links/forms, up to ~6k chars of visible text) to Groq for classification.
- Your API key is stored locally via Chrome `storage.local` and is never committed to the repo.
- Caches only a per-origin verdict in `storage.session` to avoid re-checking repeatedly.

## Inspiration & credits

- Inspired by the idea and impact focus behind Javier Gallo Roca’s iOS app “Is This Safe?”. See the original context in his [LinkedIn post](https://www.linkedin.com/feed/update/urn:li:activity:7359261700857962496/).
- This project is an independent Chrome MV3 extension implementation; it is not affiliated with or endorsed by Javier or his app.

## Privacy

- The extension computes a compact summary in-page and sends it to Groq for a one-off classification. No full-page HTML is uploaded.
- No browsing history is stored by the extension. Verdicts are cached per origin only for the current browser session.
