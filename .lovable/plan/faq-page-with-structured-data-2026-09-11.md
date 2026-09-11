# FAQ page with structured data

## What you get

A new page at `/faq` that answers the questions people actually hit when they try the demo, plus a short list of recommended tools (browsers, speed test, DNS check) so someone on a slow or old device can sort themselves out. The home page and the hardware page link to it.

## Questions covered

**The browser chat**
- What is actually happening when I chat here? (model downloaded once, runs on your device, nothing sent to a server)
- Why is the first use a big download? (380 MB to 1.1 GB, cached afterwards)
- Where is the model stored, and how do I remove it?
- Is my conversation private? Does it work offline?
- Which browsers and devices work best?

**The human check**
- Why is there a check before the download starts? (stops bots pulling hundreds of megabytes)
- What happens if it fails or doesn't appear?

**Processor-only mode**
- Why does it say "running on the processor"? (no graphics acceleration available)
- Why is it so much slower, and which model does it use? (one small ~380 MB model)
- Can I force one mode or the other?
- Why isn't the Neural Engine used? — links to the existing `/neural-engine` page

## Suggested tools section

Grouped links, each with one line saying why it helps:
- Browsers: Chrome, Edge, Firefox, Safari (with a note on which support graphics acceleration)
- Connection: Cloudflare speed test, Fast.com
- Graphics support check: WebGPU report page
- DNS: Cloudflare 1.1.1.1, Google Public DNS, plus a DNS-speed checker

All external links open in a new tab with `rel="noopener noreferrer"`.

## Links in

- Home page: a short line under the chat pointing to "Questions and troubleshooting".
- Hardware page: a link alongside the existing "Back to the demo" link.

## Structured data

- `/faq`: FAQPage JSON-LD built from the same question/answer data that renders on screen, so the two can never drift, plus BreadcrumbList.
- Home page: WebSite + SoftwareApplication JSON-LD describing the demo.
- Hardware page: Article JSON-LD.

## Technical notes

- New route `src/routes/faq.tsx` following the existing pattern in `neural-engine.tsx`: `createFileRoute`, `staticData: { sitemap: true }`, `head()` with title, description, og:title, og:description, og:url, og:type, canonical, and a `scripts` entry of `type: "application/ld+json"`.
- Q&A content lives in a typed array in the route file; the accordion and the JSON-LD both map over it.
- UI composed from existing design-system components only — `WaAccordion`/`WaAccordionItem` for the questions, `WaCard` for the tools section, `WaIcon`, `WaCallout`, `WaDivider` — reusing the `odc-shell` / `odc-lede` / `odc-card-heading` classes already in `on-device-chat.css`. No new tokens or literal values.
- `WebAwesomeLoader` and `SiteFooter` on the page, matching the other routes.
- JSON-LD added to `index.tsx` and `neural-engine.tsx` via the existing `head()` — no new metadata plumbing.
- Sitemap picks the route up automatically from `staticData.sitemap`.
