# Repository hand-off documentation

Goal: anyone can clone this repo, understand it, build it, and keep it going without Lovable. No application code changes.

## Audit findings (confirmed by reading the project)

- React 19 + TanStack Start/Router, Vite, Tailwind CSS 4, Bun (`bun.lock`), Web Awesome design system.
- No backend: no database, no login, no server functions at request time. The chat runs a language model inside the visitor's own browser (`@mlc-ai/web-llm` for graphics-accelerated devices, `@wllama/wllama` for processor-only).
- No environment variables and no `.env` file: nothing secret is needed to build or run the site.
- Build: `bun run build` (`vite build` plus the copy script), output in `dist/client`; seven pages prerendered; installable-app files (`sw.js`, manifest) included.
- Seven pages: home, questions, Llama 3 in the browser, model comparison, device diagnostics, Neural Engine, credits.

## What gets written

1. **`README.md` rewritten** — what the app is, the live address, feature list, credits and licences (Web Awesome, Font Awesome Free, the two model runtimes, the models themselves), the stack, exact local setup commands with required Node/Bun versions, build and hosting summary, and links to the new guides.
2. **`docs/architecture.md`** — folder-by-folder map (`src/routes`, `src/components`, `src/lib/webllm`, `src/design-system`, `scripts`, `public`), the decisions that matter (everything runs in the browser; pages prerendered to files; pre-flight device check before download; model choice and warm start; design-system tokens only), and the gotchas we actually hit: the model runtimes must be loaded only after the page is running in the browser, the installable-app worker is only registered outside previews, boolean properties on Web Awesome buttons must be set directly, and the static build has no request-time server.
3. **`docs/deployment.md`** — static hosting on Spacefast, install and build commands, output folder, the deep-link rule in `public/_redirects`, sitemap and robots, the domain/DNS note (handled by you), and how to bring back anything server-backed later.
4. **`docs/environment.md`** — states plainly that no variables are required, lists the optional build-time ones the tooling understands, and the rule that anything secret must never live in browser code.
5. **`roadmap.md`** — completed milestones ticked off from the sixteen saved plan notes, plus the open items (optional human check via a small helper service, future model additions, hosting follow-ups).
6. **`SPACEFAST.md` kept** and linked from the deployment guide instead of duplicated.

## Verification

Check every link in the new files resolves to a committed file, confirm no keys or tokens appear in any documentation, and run the type check and lint to confirm nothing broke.
