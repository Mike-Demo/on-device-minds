# On-device AI — a language model running in your browser

Run a small language model right inside your browser. No server, no API
key, no account — the chat happens entirely on your own device, using
its graphics chip (or the processor as a fallback).

Nothing here talks to a server. The model downloads once into this
browser and then answers on your own hardware — offline, private, and
free to run.

## How it works

1. A pre-flight check looks at your device: graphics acceleration
   (WebGPU), memory, storage headroom, and network type.
2. You pick a model. It downloads once from Hugging Face and is cached
   in the browser.
3. Chat runs token-by-token on your own hardware. Nothing typed ever
   leaves the device.

## Models

- Qwen2.5 0.5B Instruct — about 380 MB
- Llama 3.2 1B Instruct — about 880 MB
- Qwen2.5 1.5B Instruct — about 1090 MB
- Phi-4 mini Instruct — about 2300 MB
- Processor-only fallbacks: SmolLM2 360M Instruct (~270 MB),
  Qwen2.5 0.5B Instruct (~380 MB)

## Pages

- [Questions and troubleshooting](https://ai.mikedemo.dev/faq/)
- [Run Llama 3 in your browser](https://ai.mikedemo.dev/models/llama-3-in-browser/)
- [Compare the models](https://ai.mikedemo.dev/models/compare/)
- [Check this device](https://ai.mikedemo.dev/diagnostics/)
- [Why the Neural Engine isn't used](https://ai.mikedemo.dev/neural-engine/)
- [About](https://ai.mikedemo.dev/about/)
- [For developers](https://ai.mikedemo.dev/developers/)
- [Open source & credits](https://ai.mikedemo.dev/licenses/)
- [Privacy](https://ai.mikedemo.dev/privacy/)
- [Contact](https://ai.mikedemo.dev/contact/)

## Agent documents

- llms.txt: https://ai.mikedemo.dev/llms.txt
- Agent card: https://ai.mikedemo.dev/.well-known/agent-card.json
- Agent Skills: https://ai.mikedemo.dev/.well-known/agent-skills/index.json
- Resource catalog: https://ai.mikedemo.dev/.well-known/ard.json
- Authentication (there is none): https://ai.mikedemo.dev/auth.md
- Pricing (free): https://ai.mikedemo.dev/pricing.md
