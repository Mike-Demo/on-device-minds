# Model comparison page

A new page at `/models/compare` that sets Llama 3.2 1B, Qwen 2.5 (0.5B and 1.5B) and Phi-4 mini
side by side, plus a link to it from the home page.

## What the page shows

A comparison table with one row per model:

| Column | Source |
| --- | --- |
| Model | the picker label already used in the chat |
| One-time download | the exact figure the app already stores (380 MB / 880 MB / 1.09 GB / 2.3 GB) |
| Memory needed | derived from the download size, stated as a floor ("about 1 GB free", etc.) |
| Speed | described in plain relative terms, not a made-up number |
| Best for | the blurb already shown in the picker |

Below the table:

- A short "how to choose" section: older iPad or laptop, everyday laptop, desktop with a good
  graphics card.
- A note that these four run on the graphics chip, and that a device without it falls back to the
  smaller processor-only models — with the one speed figure actually measured on this site
  (roughly 2.5 tokens a second in processor-only mode).
- Links out to the chat, the FAQ, the Llama 3 page and the Neural Engine page.

## Being honest about speed

The site has no measured tokens-per-second for the graphics-accelerated models — only for
processor-only mode. So the speed column gives an ordering ("fastest", "noticeably slower than
Qwen 0.5B", ...) tied to model size and states plainly that actual speed depends on the device.
No invented benchmark numbers, no fake ratings.

## Home page link

Add the compare page next to the existing "Run Llama 3 in your browser" link, using the same
wording style and the same components. No layout or styling changes elsewhere.

## Technical notes

- New route `src/routes/models.compare.tsx` at `/models/compare`, following the existing
  `models.llama-3-in-browser.tsx` pattern: `staticData: { sitemap: true }`, in-meta title and
  description, absolute self-referencing canonical and `og:url` via `@/lib/seo`.
- Table rows generated from `ON_DEVICE_MODELS` and `CPU_MODELS` in `src/lib/webllm/models.ts`, with
  a small per-model memory/speed annotation map in the route file — so download sizes can never
  drift from what the chat actually downloads.
- Structured data: `Article` and `BreadcrumbList` from the shared `@/lib/seo` helpers, plus an
  `ItemList` naming the four models in table order. No `Product` or review markup.
- Add `/models/compare` to the prerender list in `vite.config.ts`.
- Built with existing design-system components (`WaCard`, `WaDivider`, `WaBadge`, `WaCallout`) and
  the existing `odc-*` classes; readable on a phone, no new CSS.
- Verify: typecheck, production build, page prerenders, and the JSON-LD parses.
