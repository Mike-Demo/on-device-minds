# For developers — On-device AI

How the On-device AI browser demo is built, where the agent-facing
documents live, and the honest truth: there is no public API.
Full page: https://ai.mikedemo.dev/developers/

## How it is built

React 19 + TanStack Start, prerendered to static HTML at build time and
served as plain files — there is no request-time server. Inference is
WebLLM (WebGPU) with a wllama (WebAssembly) fallback for the
processor-only path. Model weights download once from Hugging Face and
are cached in the browser. Source:
https://github.com/Mike-Demo/on-device-minds

Because there is no backend, there is deliberately no OpenAPI spec, no
OAuth metadata, no Web Bot Auth directory, and no NLWeb ask endpoint —
publishing any of those would be fiction. The agent-facing surface is
documentation: read it, and guide users to the page itself.

## Machine-readable documents

- llms.txt: https://ai.mikedemo.dev/llms.txt — site summary, pages,
  models, agent guidance.
- llms.md: https://ai.mikedemo.dev/llms.md — cold-discovery markdown.
- agent-card.json: https://ai.mikedemo.dev/.well-known/agent-card.json —
  A2A card (documentation surface only, no message endpoint).
- agent-skills/index.json:
  https://ai.mikedemo.dev/.well-known/agent-skills/index.json — three
  skills: chat-on-device, compare-models, diagnose-device.
- ard.json: https://ai.mikedemo.dev/.well-known/ard.json — Agentic
  Resource Discovery catalog with trust manifests.
- ai-catalog.json:
  https://ai.mikedemo.dev/.well-known/ai-catalog.json — alias of the
  ARD catalog.
- auth.md: https://ai.mikedemo.dev/auth.md — authentication: there is
  none, stated plainly.
- pricing.md: https://ai.mikedemo.dev/pricing.md — pricing: free, no
  tiers.
- schema-map.xml: https://ai.mikedemo.dev/schema-map.xml — NLWeb Schema
  Map of the structured-data feed.
