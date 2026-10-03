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

const title = "Contact — On-device AI";
const description =
  "How to reach the maker of the On-device AI browser demo: email and public profiles.";

const PAGE_URL = pageUrl("/contact");

const jsonLd = articleJsonLd({
  headline: "Contact",
  description,
  path: "/contact",
  datePublished: "2026-10-03",
  dateModified: "2026-10-03",
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
]);

const MD_URL = "https://ai.mikedemo.dev/contact.md";

export const Route = createFileRoute("/contact")({
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

  component: ContactPage,
});

function ContactPage(): ReactElement {
  return (
    <>
      <WebAwesomeLoader />
      <main>
        <div className="odc-shell wa-stack wa-gap-2xl">
          <header className="wa-stack wa-gap-s">
            <div className="wa-cluster wa-gap-s wa-align-items-center">
              <BrandMark className="odc-brand-mark" />
              <h1>Contact</h1>
            </div>
            <p className="odc-lede">
              Found a bug, have a question about on-device inference, or
              want to talk about the demo? Here is how to reach the human
              behind it.
            </p>
          </header>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="envelope" />
              <h2 className="odc-card-heading">Email</h2>
            </div>
            <p>
              The fastest way to reach MikeDemo about this demo is email:{" "}
              <a href="mailto:hey.demo@mikedemo.email">hey.demo@mikedemo.email</a>.
              Bug reports are especially welcome — include your browser
              and OS version, and what the diagnostics page at{" "}
              <Link to="/diagnostics">/diagnostics/</Link> reported.
            </p>
          </WaCard>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="share-nodes" />
              <h2 className="odc-card-heading">Elsewhere</h2>
            </div>
            <p>
              MikeDemo is also reachable on{" "}
              <a href="https://github.com/Mike-Demo">GitHub</a> (where the
              demo&apos;s source lives),{" "}
              <a href="https://www.linkedin.com/in/mikedemopoulos">LinkedIn</a>,
              and <a href="https://x.com/mike_demo">X</a>. There is no
              support desk, no ticketing system, and no SLA — this is a
              personal experiment, answered by its maker.
            </p>
            <div className="wa-cluster wa-gap-xs">
              <Link to="/" className="odc-meta">Back to the demo</Link>
              <Link to="/about" className="odc-meta">About</Link>
              <Link to="/faq" className="odc-meta">FAQ</Link>
            </div>
          </WaCard>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
