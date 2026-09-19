# Static hosting on Spacefast

## Static check result

The site is static-safe with one exception, and you chose how to handle it:

- Every public page renders the same for every visitor. No database, no login, no per-visitor pages, no webhooks or scheduled jobs.
- The model download and chat all happen in the visitor's own browser, so nothing there needs a server.
- The only server-dependent piece is the human check on the pre-flight screen: it asks the server for its site key and has the server verify the tick with a secret key. Per your choice, the human check is removed from the static site.
- One server-generated page exists today: the sitemap. It gets replaced by a plain file.

## What changes

1. **Remove the human check.** The pre-flight screen keeps the device, graphics, storage and network checks, the speed test, and the "Download & start" step — the tick-the-box control and its messaging go away, so visitors continue as soon as the device check passes. The two server-side check helpers are deleted, and the credit for the check service is removed from the Credits page.
2. **Prerender every page.** All seven public pages are already listed for prerendering with discovery off; that list is confirmed against the routes and left complete: home, questions, Llama 3 page, model comparison, device diagnostics, Neural Engine, Credits.
3. **Build output in `dist/client`.** Keep the normal build (no static preset). Add a small post-build script that copies the built site into `dist/client`, and change the build command to run it.
4. **Static files.** Replace the generated sitemap page with a plain `public/sitemap.xml` listing all seven pages, keep `robots.txt` pointing at it, and add `public/_redirects` with `/*  /index.html  200` so deep links work.
5. **Spec file.** Add `SPACEFAST.md` with the install command, build command, and output directory.
6. **Verify.** Typecheck, full build, confirm an `index.html` for each of the seven pages plus sitemap, robots and redirects, then open each page in a browser to confirm it renders and that address-bar state still restores after load.

## Technical notes

- `@lovable.dev/vite-tanstack-config` is 2.21.0 — above the 2.20.0 floor.
- `vite.config.ts`: `tanstackStart.pages` already lists all seven routes with `prerender: { enabled: true, autoStaticPathsDiscovery: false }`. No `nitro: { preset: "static" }`.
- Delete `src/routes/sitemap[.]xml.ts` and `src/lib/hcaptcha.functions.ts`; strip captcha state, effects and markup from `src/components/entry-gate.tsx` (`canContinue` drops the `verified` condition) and drop the hCaptcha entry from `src/routes/licenses.tsx`. `src/lib/sitemap.ts` and each route's `staticData.sitemap` flag stay in place (harmless, and the routing types depend on the flag).
- `scripts/copy-static-output.mjs`: idempotent — no-op if `.output/public` is absent or already resolves to `dist/client`, otherwise recreate `dist/client` and copy recursively. The PWA plugin writes `sw.js` and `manifest.webmanifest` into `dist/client` during the client build; the script verifies both are present in `.output/public` before replacing `dist/client`, and preserves them if they are not.
- `package.json` build: `vite build && node scripts/copy-static-output.mjs`. `build:dev` gets the same copy step.
- Head metadata (title, description, og/twitter, canonical, JSON-LD) is already defined in each route's `head()`, so it is baked into the prerendered HTML; audited during verification, not re-plumbed.
- Known post-build difference to report: with the static build there is no request-time server, so anything relying on one would have to be reintroduced elsewhere.
