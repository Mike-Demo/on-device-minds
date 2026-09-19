# Spacefast build spec

This site is fully static: every page is prerendered to HTML at build time and
the chat runs entirely in the visitor's browser. No server is needed at request
time.

## Commands

| Setting            | Value                                              |
| ------------------ | -------------------------------------------------- |
| Install command    | `bun install` (or `npm install`)                   |
| Build command      | `vite build && node scripts/copy-static-output.mjs` |
| Output directory   | `dist/client`                                      |
| Node version       | 22.x                                               |

`vite build` runs the normal SSR/Nitro build, which prerenders the pages into
`.output/public` (the raw Nitro output). The post-build script copies that
directory to `dist/client`, which is what the host serves.

Do not set `nitro: { preset: "static" }` — it breaks the build with
"rolldownOptions.input should not be an html file".

## Prerendered routes

`/`, `/faq`, `/models/llama-3-in-browser`, `/models/compare`, `/diagnostics`,
`/neural-engine`, `/licenses`

Each produces its own `index.html` under `dist/client`.

## Static files

- `sitemap.xml` — lists all seven routes
- `robots.txt` — points at `/sitemap.xml`
- `_redirects` — `/*  /index.html  200`, so deep links and client-side
  navigation resolve
- `sw.js`, `manifest.webmanifest` — installable app support
