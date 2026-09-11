# Entry gate before the in-browser model

Add a gate that appears before the chat: it explains what running a model in your own browser really means, runs a quick check of this device, and asks the visitor to pass a "confirm you're human" box before the download can start.

## What the visitor sees

1. **Explanation card** — short, plain-language points:
   - The model downloads once (hundreds of megabytes to over a gigabyte) and is stored in this browser.
   - Everything runs on this device's graphics hardware; nothing is sent to a server.
   - A browser cannot use Apple's Neural Engine, with a link to the existing "Why not the Neural Engine?" page.
   - Small models make mistakes and are much weaker than cloud assistants.
2. **Pre-flight results** — a checklist with pass / warning / fail rows:
   - Graphics support (WebGPU) and the adapter name
   - Whether this looks like a phone or a low-memory device
   - Rough available memory
   - Free storage space vs. the selected model's size
   - Whether the model is already saved here (skips the download)
   - Connection speed estimate, when the browser reports one
   - A clear verdict line: likely fine / likely slow / cannot run here
3. **Human check** — an hCaptcha box; the "Continue" button stays disabled until it is passed.
4. **Continue** — warnings never block; only a genuine "cannot run here" result blocks continuing. The choice is remembered for the browser session so the gate does not reappear on every visit.

## Technical section

- `src/lib/webllm/preflight.ts` — new browser-safe module returning typed check results (`pass | warn | fail`) plus an overall verdict. Uses `inspectDevice()`, `navigator.deviceMemory`, `navigator.hardwareConcurrency`, `navigator.storage.estimate()`, `navigator.connection`, and the cache lookup already used by the chat hook. All reads are feature-detected.
- `src/components/entry-gate.tsx` — client-only component rendering the explanation, the checklist (`WaCard`, `WaCallout`, `WaIcon`, `WaBadge`, `WaSpinner`, `WaButton`) and the design system's `HCaptcha` pattern. Styling stays in `on-device-chat.css` using `--wa-*` tokens only.
- `src/components/on-device-chat.tsx` — renders the gate first; the chat mounts only after the gate is cleared. Gate acceptance stored in `sessionStorage`, read in an effect so hydration stays stable.
- `src/lib/hcaptcha.functions.ts` — server function that posts the captcha token to `https://api.hcaptcha.com/siteverify` with the secret key, validates input with zod, and returns `{ ok }`. Secret read inside the handler.
- Site key (public) goes in client code; the secret key is stored in the project's secret store. I will request `HCAPTCHA_SITE_KEY` and `HCAPTCHA_SECRET_KEY` after this plan is approved.
- `/licenses` gains an hCaptcha credit entry.

## Out of scope

No native code, no database, no changes to the model list or the chat itself beyond the gate wrapper.
