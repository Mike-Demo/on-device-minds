# On-Device AI

A live demo that downloads a small language model into your web browser and chats
with it entirely on your own hardware. No server, no API key, nothing sent
anywhere after the model file is fetched.

**Live site:** https://ai.mikedemo.dev
**Lovable project:** https://lovable.dev/projects/71e3ccbc-7f85-45cb-81ba-4b8b0e098a3e

The site is fully static: every page is prerendered to HTML at build time, and
all inference happens in the visitor's browser.

## Key features

- **In-browser chat** with a choice of small instruct models, streamed token by
  token.
- **Graphics-accelerated path** via WebGPU (`@mlc-ai/web-llm`) with models from
  Qwen2.5 0.5B (~380 MB) up to Phi-4 mini (~2.3 GB).
- **Processor-only fallback** via llama.cpp compiled to WebAssembly
  (`@wllama/wllama`), defaulting to SmolLM2 360M (~270 MB) so older laptops and
  iPads can still run the demo.
- **Pre-flight check** before any download: device and browser support, graphics
  acceleration, storage headroom, network type, and an optional ~3 MB speed test
  with Wi-Fi-over-cellular advice.
- **Device diagnostics page** reporting detected capabilities and feature flags,
  with per-device performance tips and browser suggestions.
- **Installable app (PWA)** with an offline app shell, native install prompt
  where supported, and iOS/iPadOS instructions.
- **Content pages** for FAQ, Llama 3 in the browser, model comparison, and the
  Neural Engine, all with schema.org structured data and per-page metadata.
- **Fully prerendered static output** — seven HTML pages plus sitemap, robots,
  redirects, service worker, and manifest.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + TanStack Start (file-based TanStack Router) |
| Build | Vite 8 (Nitro output), Bun as package manager |
| Styling | Tailwind CSS 4 + the Web Awesome design system (custom elements) |
| Inference | `@mlc-ai/web-llm` (WebGPU), `@wllama/wllama` (WebAssembly/CPU) |
| Offline | `vite-plugin-pwa` (Workbox) |
| Tooling | TypeScript (strict), ESLint, Prettier |

## Attribution & licences

Full credits are rendered in-app at [`/licenses`](src/routes/licenses.tsx). In
short:

- **Web Awesome** 3.12.0 — Font Awesome / Fonticons, Inc. — MIT. The component
  library behind the interface; vendored under `src/design-system/`.
- **Font Awesome Free** 7.3.1 — Fonticons, Inc. — CC BY 4.0 (icons),
  SIL OFL 1.1 (fonts), MIT (code).
- **React** — Meta and contributors — MIT.
- **TanStack Start & Router** — Tanner Linsley and contributors — MIT.
- **WebLLM** (`@mlc-ai/web-llm`) — MLC AI — Apache 2.0.
- **wllama** (`@wllama/wllama`) — MIT, wrapping llama.cpp (MIT).
- **Models** are downloaded at runtime from their own hosts and remain under
  their own licences: Qwen2.5 (Apache 2.0), Llama 3.2 (Llama 3.2 Community
  Licence), Phi-4 mini (MIT), SmolLM2 (Apache 2.0). No model weights are
  committed to this repository.

This repository's own code is private and unlicensed for redistribution.

## Local development

Prerequisites:

- **Node.js 22.x** (required by the build)
- **Bun 1.1+** (package manager; `npm` also works)

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun run dev          # http://localhost:8080
```

No `.env` file is required — the app needs no environment variables and no
secrets. See [`docs/environment.md`](docs/environment.md).

Useful scripts:

```sh
bun run dev          # dev server
bun run build        # production build -> dist/client
bun run lint         # ESLint
bun run format       # Prettier
bunx tsc --noEmit    # typecheck
```

## Build & deployment

```sh
bun run build        # vite build && node scripts/copy-static-output.mjs
```

`vite build` runs the SSR/Nitro build, which prerenders all seven routes into
`.output/public`. The post-build script copies that directory to **`dist/client`**,
which is the folder a static host serves. Deep links rely on
`public/_redirects` (`/*  /index.html  200`).

The production site is served as plain static files — there is no request-time
server. Hosting, DNS, and publishing are handled manually by the project owner;
see [`docs/deployment.md`](docs/deployment.md) and [`SPACEFAST.md`](SPACEFAST.md).

## Documentation index

- [`docs/architecture.md`](docs/architecture.md) — codebase layout, design
  decisions, and gotchas.
- [`docs/deployment.md`](docs/deployment.md) — hosting, redirects, domain/DNS.
- [`docs/environment.md`](docs/environment.md) — environment variables (none
  required) and secret-handling rules.
- [`SPACEFAST.md`](SPACEFAST.md) — the concrete Spacefast build spec.
- [`roadmap.md`](roadmap.md) — completed milestones and open items.
- [`AGENTS.md`](AGENTS.md) — conventions for AI-assisted changes.
