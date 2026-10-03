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

const title = "Privacy — On-device AI";
const description =
  "What the On-device AI demo collects (almost nothing), where model downloads come from, and what stays on your device.";

const PAGE_URL = pageUrl("/privacy");

const jsonLd = articleJsonLd({
  headline: "Privacy",
  description,
  path: "/privacy",
  datePublished: "2026-10-03",
  dateModified: "2026-10-03",
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Privacy", path: "/privacy" },
]);

const MD_URL = "https://ai.mikedemo.dev/privacy.md";

export const Route = createFileRoute("/privacy")({
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

  component: PrivacyPage,
});

function PrivacyPage(): ReactElement {
  return (
    <>
      <WebAwesomeLoader />
      <main>
        <div className="odc-shell wa-stack wa-gap-2xl">
          <header className="wa-stack wa-gap-s">
            <div className="wa-cluster wa-gap-s wa-align-items-center">
              <BrandMark className="odc-brand-mark" />
              <h1>Privacy</h1>
            </div>
            <p className="odc-lede">
              The short version: your conversations never leave your
              device. The longer version is below, and it is still short.
            </p>
          </header>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="lock" />
              <h2 className="odc-card-heading">Your chats stay yours</h2>
            </div>
            <p>
              Chat inference runs entirely in your browser — on your
              graphics chip via WebGPU or on your processor via
              WebAssembly. No chat content is sent to any server, because
              there is no server involved in chatting. There are no
              accounts, no API keys, and no analytics events recording
              what you type.
            </p>
          </WaCard>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="download" />
              <h2 className="odc-card-heading">What does leave the device</h2>
            </div>
            <p>
              Two things, both ordinary web traffic. First, the static
              files of the site itself (HTML, scripts, icons) are served
              by the host, which keeps standard server logs. Second, the
              one-time model download comes from Hugging Face
              (huggingface.co and its file hosts), so Hugging Face sees
              the download request the way any file host would. After
              that, the model is cached in your browser and repeat visits
              work offline.
            </p>
          </WaCard>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="database" />
              <h2 className="odc-card-heading">What is stored, and how to remove it</h2>
            </div>
            <p>
              The model weights live in your browser&apos;s own storage
              (Cache Storage / Origin Private File System, depending on
              the browser). To remove them, clear the site&apos;s data in
              your browser settings — the FAQ explains where to look per
              browser. Uninstalling the home-screen app does not
              automatically clear the cached model.
            </p>
            <div className="wa-cluster wa-gap-xs">
              <Link to="/faq" className="odc-meta">FAQ and troubleshooting</Link>
              <Link to="/about" className="odc-meta">About</Link>
              <Link to="/contact" className="odc-meta">Contact</Link>
            </div>
          </WaCard>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
