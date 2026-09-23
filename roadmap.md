# Roadmap

Consolidated from the plan records archived in `.lovable/plan/`.

## Completed

- [x] Browser-only AI demo: download a small model and chat with it entirely on
      the visitor's device.
- [x] Pre-flight entry gate before the model download (device, graphics, storage
      checks).
- [x] Speed and network test in the pre-flight check, with Wi-Fi-over-cellular
      guidance.
- [x] Processor-only (WebAssembly) fallback for devices without graphics
      acceleration.
- [x] Installable app (PWA): manifest, icons, guarded service worker, native
      install prompt plus iOS/iPadOS instructions.
- [x] Faster processor-only start: smaller default model (SmolLM2 360M),
      parallel downloads, tuned context/batch/threads.
- [x] Model picker with Llama 3.2 1B, Qwen2.5 1.5B, and Phi-4 mini.
- [x] Model switching disposes the running engine (no stacked engines / OOM).
- [x] App logo, favicon, and header mark.
- [x] Page explaining the hardware limits (Neural Engine).
- [x] FAQ page with structured data and links to browser/speed/DNS tools.
- [x] Model comparison page (download size, memory, speed).
- [x] Device diagnostics page with per-device tips and browser suggestions.
- [x] Llama 3 in-browser content page.
- [x] Structured data review and SEO clean-up: shared `src/lib/seo.ts`, absolute
      canonicals, breadcrumbs, single `<h1>` per page.
- [x] Performance passes: server-rendered above-the-fold home content, prerender
      coverage, preconnect hints, vendor-bundle warming, lazy runtime/model loads.
- [x] Static hosting preparation: all routes prerendered, `dist/client` output,
      static sitemap, `robots.txt`, `_redirects`, `SPACEFAST.md`.
- [x] Repository hand-off documentation: README, `docs/architecture.md`,
      `docs/deployment.md`, `docs/environment.md`, this roadmap.

## Removed deliberately

- [x] hCaptcha human check — required a secret key and a request-time server,
      which the static build has no place for. The pre-flight gate now unlocks as
      soon as the device check passes.

## Open / future

- [ ] Optional human check without a full server: a single-endpoint Cloudflare
      Worker holding the secret, called from the client. See
      [`docs/deployment.md`](docs/deployment.md).
- [ ] Consider additional small models as better quantisations appear (and keep
      `docs/architecture.md` plus the comparison page in sync when they do).
- [ ] Revisit hosting if any server-backed feature becomes a requirement —
      decide static vs. Workers before building it.
- [ ] Optional: measure real-world load and first-token times across devices and
      publish them on the comparison page (only with measured numbers, never
      estimates).
- [ ] Trim unused shadcn primitives under `src/components/ui/` once the design
      system covers everything they are used for.
