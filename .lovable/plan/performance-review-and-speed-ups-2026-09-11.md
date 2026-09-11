# Performance review and speed-ups

I went through how the site is built and what a visitor's browser actually
downloads. The build is already in good shape: the pages are pre-built into
static files, the heavy chat code and the multi-megabyte inference runtime are
split off and only fetched when needed, and repeat visits are cached.

Four real problems remain.

## What's slow, and why

**1. The first thing a visitor sees is a spinner, not the page.**
The headline "An AI model running inside this page" and the intro paragraph
live inside the chat area, which is marked browser-only. So the pre-built home
page file contains no headline at all — it's about 6 KB of near-empty markup.
The visitor waits for React plus a 790 KB component bundle before any text
appears. This hurts both the perceived speed and how search engines read the
page.

**2. The FAQ page isn't pre-built.**
The home page, Neural Engine page and licenses page are pre-built to static
files. The FAQ was added later and was never added to that list, so it is
rendered fresh on every request.

**3. Nothing warms up the outside services the page depends on.**
The human check (hCaptcha) and the model download both go to other domains.
The browser only starts connecting to them at the moment they're needed,
costing a second or so each time. There's already a warm-up for the design
system's domain; the others are missing.

**4. The component bundle is fetched late.**
The idle warm-up currently pulls the chat code, which then triggers the 790 KB
design-system bundle as a second step. Requesting it in the same idle pass
removes that extra round trip.

## What I'll change

- Move the headline, the intro paragraph and the logo out of the browser-only
  chat area and into the page itself, so they are part of the pre-built file
  and visible immediately. The chat below them keeps loading exactly as it does
  now, and the wording stays identical.
- Add the FAQ to the list of pre-built pages.
- Add early-connection hints for the human-check service and the model download
  host.
- Warm the design-system bundle in the same idle pass as the chat code.

Not changing: the model files, the offline/install setup, the human check
itself, or any wording.

## Technical notes

- `src/components/on-device-chat.tsx`: lift the `<header>` block (BrandMark,
  `<h1>`, `.odc-lede`) out of the component; keep the gate/loading branches
  returning only the interactive part so the header is not duplicated.
- `src/routes/index.tsx`: render that header statically above the
  `ClientOnly`/`Suspense` boundary, keeping the existing CSS classes so the
  layout is unchanged and hydration matches.
- `vite.config.ts`: add `{ path: "/faq" }` to `tanstackStart.pages`
  (`autoStaticPathsDiscovery` stays `false`).
- `src/routes/__root.tsx`: add `preconnect`/`dns-prefetch` links for
  `https://hcaptcha.com`, `https://newassets.hcaptcha.com` and
  `https://huggingface.co` (plus `https://cdn-lfs-us-1.hf.co` for model blobs)
  alongside the existing jsDelivr hints.
- `src/lib/prefetch.ts`: also `import()` the Web Awesome vendor bundle in the
  same idle callback.

## Verification

Typecheck, production build, then confirm: the pre-built home page file
contains the `<h1>` and intro text, `dist/client/faq/index.html` exists, and a
headless load still reaches the human check and streams a processor-mode reply.
