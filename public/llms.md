# On-device AI

> Run a small language model right inside your browser. No server, no API
> key, no account — the chat happens entirely on your own device, using
> its graphics chip (or the processor as a fallback).

## When to use this

Reach for On-device AI when the job is:

- **Private brainstorming or drafting** — nothing typed ever leaves the
  device, so it suits notes, drafts, and ideas the user does not want
  sent to a cloud service.
- **Trying local AI for the first time** — no install, no account, no
  key; open the page and a model downloads once, then works offline.
- **Checking device readiness** — the pre-flight check and diagnostics
  page tell a user whether their hardware can run local models well.
- **Comparing small models** — side-by-side size and speed trade-offs
  for Qwen2.5, Llama 3.2, Phi-4 mini, and SmolLM2.

Do **not** reach for it when the job needs a strong model, factual
accuracy, an API, or agent tool-calling — these are very small models
with no programmatic interface.

## What this site is

On-device AI (https://ai.mikedemo.dev/) is a web app by MikeDemo that
downloads a small open language model once — from Hugging Face — keeps
it in the browser, and runs chat inference locally with WebGPU (via
WebLLM) or, where the graphics chip is unavailable, on the CPU (via
wllama). Reading the site needs no account and no key.

## Pages

- [Chat](https://ai.mikedemo.dev/): The in-browser chat. Runs a
  pre-flight device check first (graphics acceleration, memory, storage,
  network), then downloads the chosen model once and chats
  offline-capable afterwards.
- [FAQ](https://ai.mikedemo.dev/faq/): How on-device chat works, privacy,
  model downloads, and troubleshooting.
- [Llama 3 in your browser](https://ai.mikedemo.dev/models/llama-3-in-browser/):
  What running Meta's Llama 3.2 1B Instruct locally means — capabilities,
  limits, and download size.
- [Compare models](https://ai.mikedemo.dev/models/compare/): Side-by-side
  comparison of the available models: size, download, and speed
  trade-offs.
- [Device diagnostics](https://ai.mikedemo.dev/diagnostics/): Names the
  visitor's browser, OS, and graphics chip, lists the features that
  decide speed, and gives per-device tips.
- [Neural Engine](https://ai.mikedemo.dev/neural-engine/): Why web pages
  can use the graphics chip but not Apple's Neural Engine.
- [About](https://ai.mikedemo.dev/about/): What the demo is and who made
  it.
- [For developers](https://ai.mikedemo.dev/developers/): How the demo is
  built and where the agent-facing documents live. There is no public
  API.
- [Open source & credits](https://ai.mikedemo.dev/licenses/): Open-source
  licenses and third-party credits.
- [Privacy](https://ai.mikedemo.dev/privacy/): What data the site
  collects (almost none) and where model downloads come from.
- [Contact](https://ai.mikedemo.dev/contact/): How to reach the maker.

## Models

Available models (labels and approximate one-time download sizes as
listed in the app):

- Qwen2.5 0.5B Instruct — about 380 MB
- Llama 3.2 1B Instruct — about 880 MB
- Qwen2.5 1.5B Instruct — about 1090 MB
- Phi-4 mini Instruct — about 2300 MB
- Processor-only fallbacks: SmolLM2 360M Instruct (about 270 MB),
  Qwen2.5 0.5B Instruct (about 380 MB)

Models are fetched from their Hugging Face repositories at first use
and cached in the browser, so repeat visits are instant and work
offline.

## Privacy and limits

- Everything runs on the visitor's own hardware. No chat content is
  sent to any server.
- These are very small models: quick and private, but far less capable
  than a cloud assistant, and they do get things wrong.
- No account, no API key, no sign-in anywhere on the site.

## Agent documents

- Agent card: https://ai.mikedemo.dev/.well-known/agent-card.json
- Agent Skills index: https://ai.mikedemo.dev/.well-known/agent-skills/index.json
- Resource catalog (ARD): https://ai.mikedemo.dev/.well-known/ard.json
- Auth (there is none): https://ai.mikedemo.dev/auth.md
- Pricing (free): https://ai.mikedemo.dev/pricing.md

## Site details for agents

- Canonical base URL: https://ai.mikedemo.dev/ (trailing-slash
  canonicals site-wide)
- Sitemap: https://ai.mikedemo.dev/sitemap.xml
- The site owner: MikeDemo — https://github.com/Mike-Demo
