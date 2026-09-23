# Deployment

The production site is **static files only**. There is no request-time server,
no database, and no server function. Any static host works; the current target
is Spacefast. See [`../SPACEFAST.md`](../SPACEFAST.md) for the host-facing spec.

> GitHub, DNS, and the publishing/login steps are handled manually by the
> project owner. Nothing in this repository automates them.

## Build

| Setting | Value |
| --- | --- |
| Node version | 22.x |
| Install command | `bun install` (or `npm install`) |
| Build command | `vite build && node scripts/copy-static-output.mjs` |
| Output directory | `dist/client` |
| Raw Nitro output | `.output/public` |

`vite build` runs the normal SSR/Nitro build, which prerenders every listed page
into `.output/public`. `scripts/copy-static-output.mjs` then copies that folder to
`dist/client`. The script is idempotent: it no-ops if the output already lives in
`dist/client`, and it merges rather than replaces if `sw.js` /
`manifest.webmanifest` did not make it across.

Do **not** set `nitro: { preset: "static" }` — the build fails with
"rolldownOptions.input should not be an html file".

## Prerendered routes

`/`, `/faq`, `/models/llama-3-in-browser`, `/models/compare`, `/diagnostics`,
`/neural-engine`, `/licenses` — each produces its own `index.html` under
`dist/client`. The list lives in `vite.config.ts` under `tanstackStart.pages`
with `prerender: { enabled: true, autoStaticPathsDiscovery: false }`. Add a new
public route there or it will not exist in the static output.

## Rewrites and fallback

`public/_redirects`:

```text
/*  /index.html  200
```

This makes deep links and client-side navigation resolve on hosts that
understand Netlify-style redirect files (Spacefast, Netlify, Cloudflare Pages).
On a host that does not, configure the equivalent SPA fallback: serve
`index.html` with status 200 for unknown paths. Because every route is also a
real `index.html`, direct page loads work even without the rule — the rule only
covers unmatched paths.

## Static files shipped

- `sitemap.xml` — all seven routes, absolute URLs on `https://ai.mikedemo.dev`.
- `robots.txt` — allows all crawlers and points at `/sitemap.xml`.
- `_redirects` — the fallback rule above.
- `sw.js`, `manifest.webmanifest`, `pwa-*.png`, `apple-touch-icon.png`,
  `favicon.svg` — installable-app support.

If the production domain changes, update `SITE_URL` in `src/lib/seo.ts`,
`public/sitemap.xml`, and the `Sitemap:` line in `public/robots.txt` together.

## Domain & DNS

The site is served at `https://ai.mikedemo.dev`. DNS points the subdomain at the
static host per that host's instructions (usually a `CNAME` for the subdomain to
the host's target, with TLS issued automatically). Domain purchase, DNS records,
and TLS are configured by the project owner in their registrar and host
dashboards.

## Alternatives & bringing back server code

- **Any static host** (Netlify, Cloudflare Pages, Vercel static, S3+CDN) works
  with the same output folder and fallback rule.
- **Cloudflare Workers** would also work: the normal build already compiles the
  server side for the Workers runtime, so hosting the whole app there would
  restore request-time server functions. Deployment (Wrangler, routes, domains)
  is a manual, owner-side task.
- **Static site plus a helper Worker** is the smallest way to regain one server
  feature (for example the removed hCaptcha human check): create a
  single-endpoint Worker in your own Cloudflare account, keep the secret there,
  and call its URL from the client. No secret ever belongs in this repository.
