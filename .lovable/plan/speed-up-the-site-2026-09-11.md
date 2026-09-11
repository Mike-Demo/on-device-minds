# Speed up the site

A pass over everything that affects how fast the pages appear, without changing how anything looks or behaves.

## What changes for a visitor

- The first paint arrives sooner: a large icon stylesheet and its font files are currently downloaded on every page but never used, so they go away.
- The three pages (home, "How this works on Apple hardware", licenses) are built once ahead of time and served as ready-made files instead of being assembled on each visit.
- Outside connections (the icon and component servers) are warmed up early so the first icon shows faster.
- The component code that powers the buttons and cards is fetched during idle time after the page is interactive, so it is already there when needed.
- Repeat visits reuse more from the browser's cache.

## Already handled, nothing to do

- **Compression (gzip/brotli)** is applied automatically by the hosting layer for every page, script, and stylesheet. Adding it in the app would corrupt pages, so it stays off.
- **Minifying** happens in the production build already.
- **Keep-alive / connection reuse** is managed by the hosting edge and cannot be set from the app.
- The AI model code and the model itself are already loaded only after the visitor passes the entry gate.

## Technical section

1. `src/routes/__root.tsx`
   - Remove the `fontawesome-free@7.3.1/css/all.min.css` link. No `fa-*` classes exist outside the design system; all 23 icon usages are `<wa-icon>`, which fetches individual SVGs. This drops ~110 KB of render-blocking CSS plus webfont requests.
   - Add `preconnect` + `dns-prefetch` for `https://cdn.jsdelivr.net` (Web Awesome CSS and Font Awesome SVGs) so the handshake overlaps parsing.
   - Keep the Web Awesome stylesheet and the local `theme.css` order unchanged (theme last still wins).
2. `vite.config.ts` — enable static prerender:
   `prerender: { enabled: true, autoStaticPathsDiscovery: false }` with `pages: [{ path: "/" }, { path: "/neural-engine" }, { path: "/licenses" }]`. All three render identically for every visitor (no cookies, session, headers, or per-user data); `/sitemap.xml` stays a server route. `@lovable.dev/vite-tanstack-config` is already 2.20.0, so prerender is effective. Verify one `index.html` per route in the build output and that the build exits.
3. `src/design-system/.../setup` stays untouched (vendor code). Instead, in `src/routes/index.tsx` and `src/routes/neural-engine.tsx`, warm the lazy chat chunk with a `requestIdleCallback`-guarded dynamic import after mount, so the code is cached before the visitor clicks Continue.
4. `src/routes/sitemap[.]xml.ts` — keep the existing `max-age=3600`, add `stale-while-revalidate`.
5. Verification: production build, confirm the prerendered HTML files exist, load `/` and `/neural-engine` headless and confirm no console errors, icons still render, and no request goes to the removed Font Awesome CSS.

## Out of scope

No changes to the chat behaviour, entry gate logic, model list, or visual design.
