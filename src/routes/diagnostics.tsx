import { ClientOnly, Link, createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { BrandMark } from "@/components/brand-mark";
import { DeviceDiagnostics } from "@/components/device-diagnostics";
import { breadcrumbJsonLd, pageUrl, webPageJsonLd } from "@/lib/seo";

import {
  SiteFooter,
  WaSpinner,
  WebAwesomeLoader,
} from "@/design-system/font-awsome-web-awesome-171158";

import "@/components/on-device-chat.css";

const title = "Device diagnostics — what your browser can and cannot do";
const description =
  "A live report of your device, browser, graphics support and storage, with tips for making an in-browser language model run faster on exactly this hardware.";

const PAGE_PATH = "/diagnostics";
const PAGE_URL = pageUrl(PAGE_PATH);

const pageJsonLd = webPageJsonLd({
  name: title,
  description,
  path: PAGE_PATH,
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Device diagnostics", path: PAGE_PATH },
]);

export const Route = createFileRoute("/diagnostics")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: PAGE_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: PAGE_URL },
      { rel: "alternate", type: "text/markdown", href: "https://ai.mikedemo.dev/diagnostics.md" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(pageJsonLd) },
      { type: "application/ld+json", children: JSON.stringify(crumbsJsonLd) },
    ],
  }),
  component: DiagnosticsPage,
});

function DiagnosticsPage(): ReactElement {
  return (
    <>
      <WebAwesomeLoader />
      <main>
        <div className="odc-shell wa-stack wa-gap-2xl">
          <header className="wa-stack wa-gap-s">
            <div className="wa-cluster wa-gap-s wa-align-items-center">
              <BrandMark className="odc-brand-mark" />
              <h1>Device diagnostics</h1>
            </div>
            <p className="odc-lede">
              Everything below is read from your own browser, right now, and stays here. It shows
              what this device can do, where it falls short, and what you can change to make an
              in-browser model run faster.
            </p>
            <div className="wa-cluster wa-gap-xs">
              <Link to="/" className="odc-meta">
                Back to the chat
              </Link>
              <Link to="/faq/" className="odc-meta">
                Questions and troubleshooting
              </Link>
              <Link to="/models/compare/" className="odc-meta">
                Compare the models
              </Link>
            </div>
          </header>

          <ClientOnly
            fallback={
              <div className="wa-cluster wa-gap-s wa-align-items-center">
                <WaSpinner />
                <span className="odc-meta">Reading this device…</span>
              </div>
            }
          >
            <DeviceDiagnostics />
          </ClientOnly>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
