# CPU fallback + installable offline app

Two additions: a slower processor-only mode so the chat still works on machines without graphics acceleration, and the ability to install the site as an app that opens without internet.

## 1. Processor-only mode

Today the pre-flight blocks anyone whose browser can't use the graphics chip. That check becomes a warning instead: the app automatically switches to a processor-only engine and says plainly that answers will be much slower.

- Add a second engine that runs a small model on the processor (llama.cpp compiled for the browser, via `wllama`), used only when graphics acceleration is unavailable.
- One model in this mode: a roughly 350 MB compact instruct model. Model choice is hidden while in processor mode.
- Pre-flight changes: "Graphics acceleration" becomes a warning, not a failure, when the processor path is usable. Blocking is reserved for browsers that can't run either path (no worker support, no WASM, or not enough free space).
- The chat header shows which path is active: "Graphics accelerated" or "Processor only (slower)".
- Loading progress, streaming answers, stop, and the speed statistics work the same in both modes.
- Nothing changes for devices that already have graphics acceleration.

## 2. Installable, offline-capable app

- Add an app manifest with name, colours, standalone display, and icons generated from the existing brand mark.
- Add offline support via `vite-plugin-pwa` (generated service worker), registered from a single guarded wrapper that never runs in the Lovable preview, in an iframe, in development, or when `?sw=off` is in the address.
- Pages use network-first caching; built assets use cache-first. Model files are already stored by the browser's own cache, so an already-downloaded model keeps working offline.
- Add a short line on the home page noting the app can be installed, and mention offline behaviour only works on the published site.

## Technical notes

- New files: `src/lib/webllm/cpu-engine.ts`, `src/lib/webllm/runtime.ts` (picks GPU vs CPU path), `src/pwa.ts` (guarded registration), `public/manifest.webmanifest`, icon PNGs under `public/`.
- Edits: `src/lib/webllm/preflight.ts` (warn instead of fail, add a WASM/worker check), `src/components/entry-gate.tsx` (wording + verdict handling), `src/components/on-device-chat.tsx` (engine selection, active-path badge, model picker hidden in CPU mode), `src/routes/__root.tsx` (manifest + theme-color + apple-touch-icon), `vite.config.ts` (PWA plugin with `devOptions.enabled: false`, `injectRegister: null`, `registerType: "autoUpdate"`), `src/routes/licenses.tsx` (credit wllama / llama.cpp and the CPU model).
- New dependency: `@wllama/wllama`. WebLLM stays the graphics-accelerated path, unchanged.
- Verify: typecheck, production build, and a headless run confirming the CPU path is selected when WebGPU is absent.

## Not included

- No Neural Engine access — still impossible from a browser; existing wording stays.
- No backend, database, or captcha changes.
