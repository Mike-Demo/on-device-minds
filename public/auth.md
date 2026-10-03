# Authentication — On-device AI

There is nothing to authenticate with.

On-device AI (https://ai.mikedemo.dev/) is a client-only web app. It has
no public API, no API keys, no OAuth server, no accounts, and no sign-in
of any kind. The chat runs entirely in the visitor's browser after a
one-time model download from Hugging Face.

- **Do not** look for an API key, OAuth authorization server, or
  protected-resource metadata — none exist.
- **Do not** send credentials anywhere; there is nothing that accepts
  them.
- If you are an agent helping a user, the only "integration" is the web
  page itself: https://ai.mikedemo.dev/

Related: the agent skills at
https://ai.mikedemo.dev/.well-known/agent-skills/index.json document the
real workflows (chat, model comparison, device diagnostics).
