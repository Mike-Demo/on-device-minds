# Architecture

## Shape of the app

A React 19 + TanStack Start site with **seven public, non-parameterised pages**,
all prerendered to static HTML at build time. There is no database, no login, no
per-visitor content, and no server function that must run at request time. The
only heavy work happens in the visitor's browser: downloading a quantised model
and running inference on it.

```text
browser
 ├─ prerendered HTML + hydrated React (TanStack Router)
 ├─ pre-flight check  ──► device / GPU / storage / network verdict
 └─ chat
     ├─ WebGPU path  → @mlc-ai/web-llm in a Web Worker
     └─ CPU path     → @wllama/wllama (llama.cpp compiled to WebAssembly)
```

## Codebase layout

| Path | Responsibility |
| --- | --- |
| `src/routes/` | File-based routes; one file per URL. `__root.tsx` is the only shell. Each route owns its `head()` metadata and JSON-LD. |
| `src/components/` | Feature components: `entry-gate.tsx` (pre-flight), `on-device-chat.tsx`, `device-panel.tsx`, `device-diagnostics.tsx`, `install-app.tsx`, `brand-mark.tsx`, `neural-engine-readout.tsx`. `ui/` holds shadcn primitives kept from the template. |
| `src/hooks/use-on-device-chat.ts` | All chat state: model selection, download progress, streaming, reset, unload, warm start. The single source of truth for the chat UI. |
| `src/lib/webllm/` | Inference and capability layer — `models.ts` (metadata only, server-safe), `engine.ts` / `engine.worker.ts` (WebGPU), `cpu-engine.ts` (WebAssembly), `device.ts`, `preflight.ts`, `diagnostics.ts`. |
| `src/lib/` | Cross-cutting helpers: `seo.ts` (canonical URLs, breadcrumb/article JSON-LD), `prefetch.ts`, `pwa.ts`, `sitemap.ts`, `error-page.ts`, `error-capture.ts`. |
| `src/design-system/font-awsome-web-awesome-171158/` | Vendored Web Awesome design system. **Never edit** — it is replaced wholesale when the library updates. |
| `scripts/copy-static-output.mjs` | Post-build copy of `.output/public` → `dist/client`. |
| `public/` | Static passthrough: `sitemap.xml`, `robots.txt`, `_redirects`, icons, vendored CSS/WASM. |

## Design decisions

- **No backend, by design.** Everything the site does is possible in the browser,
  which is what makes a static build viable. Adding anything server-backed means
  re-deciding the hosting model first.
- **State lives in one hook.** `use-on-device-chat.ts` owns engine lifecycle and
  chat state rather than spreading it across components; components stay
  presentational. React Query is available but unused for app data — there is no
  remote data to cache.
- **URL state is read-only and additive.** Routes take no required search
  params; query strings and hashes (for example `/faq#privacy`) are used for
  anchoring and must still resolve after hydration on the prerendered HTML. The
  `?sw=off` query param is a deliberate kill switch for the service worker.
- **Client vs. server boundary.** The server render must produce identical HTML
  for everyone. Anything touching `window`, `navigator`, `localStorage`, WebGPU
  or WebAssembly runs in an effect or behind a client-only boundary. `models.ts`
  deliberately contains *metadata only* so route code can import it during SSR.
- **Model selection.** Capability detection picks the runtime: WebGPU → GPU
  models, otherwise the WebAssembly CPU path, otherwise blocked with an
  explanation. Defaults favour the smallest download (Qwen2.5 0.5B on GPU,
  SmolLM2 360M on CPU); bigger models are opt-in.
- **Pre-flight before download.** No multi-hundred-megabyte fetch starts until
  the device check passes and the visitor continues. Warm start for the CPU path
  is delayed and guarded (idle, not cached, not cellular/offline) so the model
  picker is never pre-empted.
- **Styling is tokens-only.** All colour, spacing, radius, and typography values
  come from Web Awesome `--wa-*` tokens and `wa-*` utilities. No raw hex or px
  literals in component code.
- **Performance.** The home headline, logo, and intro are server-rendered; heavy
  runtimes, WASM, and model files are lazy and cached by their own layer, kept
  out of the service worker precache; the design-system vendor bundle is warmed
  in parallel via `src/lib/prefetch.ts`; preconnect/dns-prefetch hints live in
  `__root.tsx`.

## Gotchas & lessons learned

- **Never import the inference runtimes at module scope of SSR-evaluated code.**
  Both WebLLM and wllama touch `document`/`navigator` on import and crash the
  server render. They are dynamically imported after hydration only.
- **Boolean props on Web Awesome custom elements.** React does not reliably clear
  a boolean attribute it set on a custom element — the pre-flight "Continue"
  button stayed disabled. Fix: `customElements.whenDefined("wa-button")` in an
  effect, then set `element.disabled` directly on the node via a ref.
- **Web Awesome events are DOM events.** `onChange` does not fire for its form
  controls; listen for `wa-change` / `wa-input` via a ref, or drive properties
  imperatively.
- **Service worker registration is heavily guarded** (`src/lib/pwa.ts`): never in
  dev, never inside an iframe, never on Lovable preview hosts, and killable with
  `?sw=off`. A cached app shell on a preview host serves stale HTML and deleted
  chunks.
- **Do not set `nitro: { preset: "static" }`.** It breaks the build with
  "rolldownOptions.input should not be an html file". Keep the normal SSR build
  and copy `.output/public` instead.
- **Prerendering needs an explicit page list.** `tanstackStart.pages` plus
  `prerender: { enabled: true, autoStaticPathsDiscovery: false }`. Requires
  `@lovable.dev/vite-tanstack-config` ≥ 2.20.0 — older versions silently
  prerender nothing. Always confirm an `index.html` per route after building.
- **PWA output directory.** `vite-plugin-pwa` writes `sw.js` and
  `manifest.webmanifest` into `dist/client`; the copy script checks both are
  present in `.output/public` before replacing that folder, and merges instead of
  replacing if they are missing.
- **Switching models must dispose the old engine.** `disposeEngine` (interrupt →
  unload → terminate worker) and `disposeCpuEngine` (`engine.exit()`) run before
  a new model loads, otherwise engines stack and the tab runs out of memory.
- **One `<h1>` per page.** The pre-flight heading is an `<h2>` because the home
  page already has an `<h1>`.
- **Edge/worker constraints still apply to the non-static build:** no
  `child_process`, `sharp`, or native addons; everything must bundle at build
  time.
