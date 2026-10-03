import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { articleJsonLd, breadcrumbJsonLd, pageUrl } from "@/lib/seo";

import {
  SiteFooter,
  WaCard,
  WaIcon,
  WebAwesomeLoader,
} from "@/design-system/font-awsome-web-awesome-171158";
import { BrandMark } from "@/components/brand-mark";

const title = "For developers — On-device AI";
const description =
  "How the On-device AI browser demo is built, where the agent-facing documents live, and the honest truth: there is no public API.";

const PAGE_URL = pageUrl("/developers");

const jsonLd = articleJsonLd({
  headline: "For developers",
  description,
  path: "/developers",
  datePublished: "2026-10-03",
  dateModified: "2026-10-03",
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "For developers", path: "/developers" },
]);

const MD_URL = "https://ai.mikedemo.dev/developers.md";

export const Route = createFileRoute("/developers")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: PAGE_URL },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: PAGE_URL },
      { rel: "alternate", type: "text/markdown", href: MD_URL },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(jsonLd) },
      { type: "application/ld+json", children: JSON.stringify(crumbsJsonLd) },
    ],
  }),

  component: DevelopersPage,
});

const DOC_LINKS: ReadonlyArray<{ href: string; label: string; note: string }> = [
  { href: "/llms.txt", label: "llms.txt", note: "Site summary, pages, models, and agent guidance." },
  { href: "/llms.md", label: "llms.md", note: "Cold-discovery markdown: when to use this demo." },
  { href: "/.well-known/agent-card.json", label: "agent-card.json", note: "A2A agent card (documentation surface only — no message endpoint)." },
  { href: "/.well-known/agent-skills/index.json", label: "agent-skills/index.json", note: "Three skills: chat-on-device, compare-models, diagnose-device." },
  { href: "/.well-known/ard.json", label: "ard.json", note: "Agentic Resource Discovery catalog with trust manifests." },
  { href: "/.well-known/ai-catalog.json", label: "ai-catalog.json", note: "Alias of the ARD catalog." },
  { href: "/auth.md", label: "auth.md", note: "Authentication: there is none, stated plainly." },
  { href: "/pricing.md", label: "pricing.md", note: "Pricing: free, no tiers." },
  { href: "/schema-map.xml", label: "schema-map.xml", note: "NLWeb Schema Map of the structured-data feed." },
];

function DevelopersPage(): ReactElement {
  return (
    <>
      <WebAwesomeLoader />
      <main>
        <div className="odc-shell wa-stack wa-gap-2xl">
          <header className="wa-stack wa-gap-s">
            <div className="wa-cluster wa-gap-s wa-align-items-center">
              <BrandMark className="odc-brand-mark" />
              <h1>For developers</h1>
            </div>
            <p className="odc-lede">
              The honest summary first: this is a client-only web app.
              There is no public API, no API key, no OAuth, and no MCP
              server. What follows is how it is built and where the
              machine-readable documents live.
            </p>
          </header>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="code" />
              <h2 className="odc-card-heading">How it is built</h2>
            </div>
            <p>
              React 19 + TanStack Start, prerendered to static HTML at
              build time and served as plain files — there is no
              request-time server. Inference is WebLLM (WebGPU) with a
              wllama (WebAssembly) fallback for the processor-only path.
              Model weights download once from Hugging Face and are
              cached in the browser. The source is on{" "}
              <a href="https://github.com/Mike-Demo/on-device-minds">GitHub</a>.
            </p>
            <p>
              Because there is no backend, there is deliberately no
              OpenAPI spec, no OAuth metadata, no Web Bot Auth directory,
              and no NLWeb ask endpoint — publishing any of those would
              be fiction. The agent-facing surface is documentation:
              read it, and guide users to the page itself.
            </p>
          </WaCard>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="book" />
              <h2 className="odc-card-heading">Machine-readable documents</h2>
            </div>
            <ul className="wa-stack wa-gap-s">
              {DOC_LINKS.map((doc) => (
                <li key={doc.href}>
                  <a href={doc.href}>
                    <code>{doc.label}</code>
                  </a>{" "}
                  — {doc.note}
                </li>
              ))}
            </ul>
            <div className="wa-cluster wa-gap-xs">
              <Link to="/" className="odc-meta">Back to the demo</Link>
              <Link to="/faq" className="odc-meta">FAQ</Link>
              <Link to="/about" className="odc-meta">About</Link>
            </div>
          </WaCard>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
