# Install as an app + faster processor-only start

Two things: make the "install to home screen" flow real and visible, and make the
processor-only chat smaller and quicker to start on older laptops and iPads.

## 1. Install flow

Everything behind the scenes (app manifest, icons, offline caching) already exists — what
is missing is anything a visitor can actually see or tap.

- Add a small **Install app** control near the top of the demo page.
  - On Android and desktop Chrome/Edge: shows a real install button that opens the
    browser's install prompt.
  - On iPhone/iPad Safari: shows a short "Add to Home Screen" step list instead
    (Share → Add to Home Screen), since Safari has no prompt.
  - Hidden entirely when the app is already installed and running standalone, or when the
    browser offers no way to install.
- Add the status-bar and title tags iOS needs so the installed app opens without browser
  chrome, and confirm the app name, icon, and start page look right when launched.
- Add a short FAQ entry explaining what installing does (offline access, own icon, the
  downloaded model stays available).

## 2. Faster processor-only chat

- Offer **two processor models**, defaulting to the smaller one:
  - **SmolLM2 360M Instruct** (~270 MB) — new default, quickest to download and start.
  - **Qwen2.5 0.5B Instruct** (~380 MB) — current model, kept as the "better answers"
    option.
  A simple two-option picker appears in processor mode, showing each size, with the
  already-saved one marked. Graphics-accelerated mode keeps its existing four models.
- **Start early**: once the device check passes, begin fetching the processor model in the
  background so it is ready (or nearly ready) by the time someone types. The visible
  progress bar and the "Load" button still behave the same; the button simply completes
  much faster. This only runs in processor mode and never when the person is on mobile
  data or offline.
- **Tune the loading itself** for low-power machines: fetch the model in parallel chunks,
  size the working context to what a small model actually needs, and pick a sensible
  number of processor threads instead of the default. Together this cuts both the download
  wait and the pause between "downloaded" and "ready".
- Keep the saved-model check, offline behaviour, progress text, streaming, reset, and
  speed statistics exactly as they are.

## Technical notes

- `src/components/install-app.tsx` (new): captures `beforeinstallprompt`, tracks
  `display-mode: standalone` / `navigator.standalone`, renders a `WaButton` +
  `WaCallout`/`WaDetails` iOS step list from existing design-system components only.
  Mounted from `src/routes/index.tsx`.
- `src/routes/__root.tsx`: add `apple-mobile-web-app-status-bar-style`; existing manifest,
  theme-color and `registerServiceWorker()` wiring is unchanged. No new service worker
  code and no changes to the guarded registration in `src/lib/pwa.ts`.
- `src/lib/webllm/models.ts`: replace the single `CPU_MODEL` constant with a
  `CPU_MODELS` array (`HuggingFaceTB/SmolLM2-360M-Instruct-GGUF` Q4_K_M default, existing
  bartowski Qwen2.5 0.5B second), a `DEFAULT_CPU_MODEL_ID`, and a `findCpuModel()` helper.
  `CPU_MODEL_URL` becomes a per-model function; update its callers in `preflight.ts`
  (speed sample + download size) and `cpu-engine.ts`.
- `src/lib/webllm/cpu-engine.ts`: `createCpuEngine(modelId, onProgress)`; pass
  `parallelDownloads`, `n_ctx: 1024`, `n_threads` derived from
  `navigator.hardwareConcurrency` (capped), `n_batch` tuned for CPU. `isCpuModelCached`
  takes a model id.
- `src/hooks/use-on-device-chat.ts`: add `cpuModelId` + setter, thread it through cache
  checks and loading, and add a guarded prefetch effect (processor runtime, not cached,
  not cellular/offline via the existing `preflight` helpers, once per session) that calls
  the same load path.
- `src/components/on-device-chat.tsx`: processor-mode model picker reusing the existing
  radio-group markup; wording matches the current copy style.
- `src/routes/faq.tsx`: one new Q&A entry (auto-flows into the existing FAQ structured
  data).
- Verify: `bunx tsgo --noEmit`, production build, and a headless check that the install
  control renders, processor mode defaults to the smaller model, and it still streams a
  real reply.
