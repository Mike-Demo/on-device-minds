# Compare page + device diagnostics page

Two new pages, plus links from the home page and the pre-flight check.

---

## 1. Model comparison page — `/models/compare`

A table setting the four graphics-accelerated models side by side:

| Column | Source |
| --- | --- |
| Model | the label already used in the chat picker |
| One-time download | the exact figure the app stores (380 MB / 880 MB / 1.09 GB / 2.3 GB) |
| Memory needed | derived from the download size, stated as a floor ("about 1 GB free") |
| Speed | plain relative wording, not a made-up number |
| Best for | the blurb already shown in the picker |

Below the table:

- A short "how to choose" section: older iPad or laptop, everyday laptop, desktop with a good
  graphics card.
- A note that a device without graphics acceleration falls back to the smaller processor-only
  models, with the one speed figure actually measured here (roughly 2.5 tokens a second).
- Links to the chat, the FAQ, the Llama 3 page and the Neural Engine page.

**Honesty about speed.** There are no measured tokens-per-second figures for the
graphics-accelerated models, so the speed column gives an ordering tied to model size and says
plainly that real speed depends on the device. No invented benchmarks, no review or rating markup.

**Home link.** Added next to the existing "Run Llama 3 in your browser" link, same wording style
and components.

---

## 2. Diagnostics page — `/diagnostics`

Opened from a new section at the bottom of the pre-flight check ("Full device report"), and
reachable directly. Everything is read live in the browser; nothing is sent anywhere.

**What it reports**

- **Device and browser** — browser name and version, engine, operating system and version, Apple
  Silicon / iPad detection, screen size, pixel density, touch, memory reported, processor cores,
  language, saved-data mode.
- **Graphics** — whether WebGPU is present, the adapter description, the limits and features the
  adapter advertises, and WebGL fallback details (renderer string) so a switched-off hardware
  acceleration setting is visible.
- **Capabilities that affect speed** — WebAssembly SIMD and threads, SharedArrayBuffer and
  cross-origin isolation, Web Workers, storage quota and how much of the model is already cached,
  service worker and offline readiness, network type and speed estimate.

Each row shows the reading, a good / caution / missing marker, and one sentence on why it matters.

**Tips tailored to what was found**

Rules driven by the readings, for example: Safari on iOS with WebGPU missing points at
Settings → Apps → Safari → Advanced → Feature Flags (WebGPU, WebAssembly options); Edge or Chrome
without an adapter points at the "Use graphics acceleration when available" setting and the
`chrome://gpu` / `edge://gpu` report; low memory or few cores suggests the smaller model and
closing tabs; missing WebAssembly threads explains the slower processor-only path; cellular or
data-saver suggests Wi-Fi.

**Alternative browsers**

Suggested per detected platform — on iOS, noting that every browser there uses the same WebKit
engine, so the feature flags matter more than switching browsers; on Windows, macOS, Android and
Linux, the browsers already listed on the FAQ page, reusing those links.

**Copy button** so a visitor can paste the whole report when asking for help.

---

## Technical notes

- New routes `src/routes/models.compare.tsx` and `src/routes/diagnostics.tsx`, following the
  existing `models.llama-3-in-browser.tsx` pattern: `staticData: { sitemap: true }`, in-meta title
  and description, absolute canonical and `og:url` via `@/lib/seo`, `BreadcrumbList` JSON-LD.
  Compare page also gets `Article` plus an `ItemList` naming the four models in table order.
- Compare rows generated from `ON_DEVICE_MODELS` / `CPU_MODELS` so download sizes cannot drift from
  what the chat actually downloads; memory and speed annotations live in a small per-model map in
  the route file.
- Detection extends `src/lib/webllm/device.ts` with a new browser-safe
  `src/lib/webllm/diagnostics.ts` that returns a typed report; it reuses `inspectDevice()` and the
  existing network helpers in `preflight.ts` rather than duplicating them. Tip rules are pure
  functions over that report, so they are unit-testable.
- The diagnostics UI is client-only (`ClientOnly`), since every reading is browser state; the page
  shell, heading and metadata stay server-rendered for SEO.
- Only capabilities the browser actually exposes are shown — no user-agent guessing dressed up as a
  fact, and unknown readings say "not reported" rather than assuming.
- Built with existing design-system components (`WaCard`, `WaCallout`, `WaBadge`, `WaDivider`,
  `WaCopyButton`) and existing `odc-*` classes; readable on a phone, no new CSS, no new packages.
- Both routes added to the prerender list in `vite.config.ts`; FAQ gains one line pointing at the
  diagnostics page.
- Verify: typecheck, production build, both pages prerender and return 200, JSON-LD parses, and a
  headless run of the diagnostics page shows real readings.
