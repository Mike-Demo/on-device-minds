# Environment variables

**This project requires none.** There is no `.env` file, no `.env.example`, no
API key, and no secret of any kind. A fresh clone builds and runs with only
`bun install` and `bun run dev`.

That is deliberate: the site is fully static and all inference happens in the
visitor's browser, so there is nothing to authenticate against.

## Variables the tooling understands (all optional)

| Name | Set by | What it controls |
| --- | --- | --- |
| `NODE_ENV` | tooling | `production` during builds; guards development-only code paths. |
| `TSS_PRERENDERING` | TanStack Start | Set while pages are being prerendered. Use it to skip work that would hold the build process open (timers, pollers). |
| `VITE_*` | you, optionally | Any variable prefixed `VITE_` is inlined into the browser bundle at build time. None are used today. |

## Rules if variables are ever added

- `VITE_*` values are **public** — they end up in the shipped JavaScript. Only
  publishable identifiers (a captcha site key, an analytics ID) may go there.
- **Never** put a secret key in this repository or in any `VITE_*` variable. A
  static site has no server to hide it in. A secret belongs in a small
  server-side endpoint you own (for example a Cloudflare Worker), read there at
  request time.
- Server-only values must be read **inside** a handler (`process.env['NAME']`),
  never at module scope.
- If a required variable is ever introduced, add a committed `.env.example` with
  the name and a description — never a real value — and document it in this table.

## Runtime endpoints the app talks to

No credentials are involved; these are public, unauthenticated fetches made by
the visitor's browser:

- Hugging Face — GGUF model files for the processor-only path.
- The MLC model CDN — model shards for the WebGPU path.
- Font Awesome's keyless CDN — icon SVGs and webfonts.
- The speed-test endpoint used by the optional pre-flight network test.
