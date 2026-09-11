# Performance deep dive

I measured what a visitor actually downloads on a cold visit to the home page,
and what the offline install stores. The big pieces are already handled: pages
are pre-built to static files, the multi-megabyte model runtime is split off and
only fetched when it's needed, and repeat visits are cached.

Five real costs remain.

## What I found

**1. The style sheet that lays out every page comes from someone else's server.**
Before anything can be painted, the browser fetches the Web Awesome style sheet
from a public CDN. That's an extra DNS lookup, connection and round trip on a
domain we don't control, and it blocks the first paint on every page. Everything
else the site needs is already served from our own domain.

**2. The offline install downloads 780 KB it will never use.**
The saved-for-offline list includes a second copy of the component bundle — the
server-rendering variant — which this site never loads. It is stored on every
install and re-downloaded on every update.

**3. Every page loads a data-fetching layer that no page uses.**
The site wraps itself in TanStack Query, but there isn't a single query anywhere
in the app; all data is device-local. It is dead weight inside the main
JavaScript file (about 119 KB compressed).

**4. The human check waits on an extra round trip.**
The gate asks our server for the hCaptcha site key, and only then starts loading
the check itself. The key is public information, so that first request is pure
delay in front of the slowest part of the gate.

**5. The processor-only runtime (318 KB) is stored offline for everyone.**
It is only ever used on devices without graphics acceleration, but the offline
install saves it on every device.

## What I'll change

- Serve the Web Awesome style sheet from this site instead of the public CDN, so
  the first paint no longer waits on a third-party connection.
- Drop the unused server-rendering bundle and the processor-only runtime from the
  offline install list.
- Remove the unused data-fetching layer from every page.
- Publish the human-check key with the page so the check starts immediately,
  keeping the current server lookup as a fallback if the key isn't set at build
  time.

Not changing: any wording, layout, the models, the offline behaviour visitors
see, the human check itself, or anything under the design-system folder.

## Technical notes

- `public/vendor/webawesome-3.12.0.css`: copy of the pinned CDN stylesheet;
  `src/routes/__root.tsx` links that path instead of `cdn.jsdelivr.net`, and the
  jsDelivr `preconnect`/`dns-prefetch` stays (icon SVGs still resolve there).
- `vite.config.ts` → `workbox.globIgnores`: add `**/webawesome.ssr.bundle-*.js`
  and `**/esm-*.js`. Both remain fetchable on demand; only precaching changes.
- `src/router.tsx` / `src/routes/__root.tsx`: drop `QueryClient`,
  `QueryClientProvider` and the `createRootRouteWithContext` query context. No
  call site uses `useQuery`, so this is a straight removal.
- `src/lib/hcaptcha.functions.ts` + `src/components/entry-gate.tsx`: read
  `import.meta.env.VITE_HCAPTCHA_SITE_KEY` first and render the widget
  synchronously when present; fall back to the existing `getCaptchaSiteKey`
  server function otherwise. `verifyCaptcha` and the secret key are untouched.

## Verification

Typecheck, production build, then compare: no `cdn.jsdelivr.net` stylesheet in
the built HTML, the precache manifest no longer lists the SSR bundle or the
processor runtime, the main entry chunk shrinks, and a headless load still
renders the gate, passes the human check and streams a processor-mode reply.
