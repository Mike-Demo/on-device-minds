import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import type { ReactElement, ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import { warmChatChunk } from "@/lib/prefetch";
import { articleJsonLd, breadcrumbJsonLd, pageUrl } from "@/lib/seo";

import { ON_DEVICE_MODELS } from "@/lib/webllm/models";

import {
  SiteFooter,
  WaBadge,
  WaCallout,
  WaCard,
  WaDivider,
  WaIcon,
  WebAwesomeLoader,
} from "@/design-system/font-awsome-web-awesome-171158";

import "@/components/on-device-chat.css";

const title = "Run Llama 3 in your browser — no server, no install";
const description =
  "Llama 3.2 1B runs entirely inside this page on your graphics chip. What it downloads, what hardware it needs, how fast it is, and how to try it.";

const PAGE_PATH = "/models/llama-3-in-browser";
const PAGE_URL = pageUrl(PAGE_PATH);

const LLAMA = ON_DEVICE_MODELS.find((model) => model.id.startsWith("Llama-3.2-1B"));

const jsonLd = articleJsonLd({
  headline: "Run Llama 3 in your browser",
  description,
  path: PAGE_PATH,
  datePublished: "2026-09-10",
  dateModified: "2026-09-11",
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Run Llama 3 in your browser", path: PAGE_PATH },
]);

export const Route = createFileRoute("/models/llama-3-in-browser")({
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
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(jsonLd) },
      { type: "application/ld+json", children: JSON.stringify(crumbsJsonLd) },
    ],
  }),

  component: LlamaInBrowserPage,
});

interface RowProps {
  readonly label: string;
  readonly value: ReactNode;
}

function Row({ label, value }: RowProps): ReactElement {
  return (
    <>
      <WaDivider />
      <div className="wa-stack wa-gap-3xs">
        <strong>{label}</strong>
        <span className="odc-meta">{value}</span>
      </div>
    </>
  );
}

function LlamaInBrowserPage(): ReactElement {
  useEffect(() => warmChatChunk(), []);

  const downloadMb = LLAMA?.approxDownloadMb ?? 880;

  return (
    <>
      <WebAwesomeLoader />
      <main>
        <div className="odc-shell wa-stack wa-gap-2xl">
          <header className="wa-stack wa-gap-s">
            <div className="wa-cluster wa-gap-s wa-align-items-center">
              <BrandMark className="odc-brand-mark" />
              <h1>Run Llama 3 in your browser</h1>
            </div>

            <p className="odc-lede">
              Meta&apos;s Llama 3.2 1B is one of the models you can pick in the chat on this site. It
              downloads once, about {downloadMb} MB, and then answers entirely on your own machine —
              no server, no API key, no account.
            </p>
            <div className="wa-cluster wa-gap-xs">
              <Link to="/" className="odc-meta">
                Try it in the chat
              </Link>
              <Link to="/faq/" className="odc-meta">
                Questions and troubleshooting
              </Link>
              <Link to="/neural-engine/" className="odc-meta">
                Why the Neural Engine isn&apos;t used
              </Link>
            </div>
          </header>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="microchip" />
              <h2 className="odc-card-heading">What your device needs</h2>
            </div>
            <div className="wa-stack wa-gap-m">
              <p>
                Llama 3.2 1B runs on your graphics chip through WebGPU, the browser standard that
                gives a web page access to graphics hardware. That support is what decides whether
                this model is available to you.
              </p>
              <div className="wa-cluster wa-gap-xs">
                <WaBadge variant="success" appearance="filled" pill>
                  Chrome and Edge: supported
                </WaBadge>
                <WaBadge variant="success" appearance="filled" pill>
                  Safari 18 and later: supported
                </WaBadge>
                <WaBadge variant="neutral" appearance="outlined" pill>
                  Older browsers: processor-only mode instead
                </WaBadge>
              </div>
              <p className="odc-meta">
                Roughly 2 GB of free memory keeps it comfortable. If your browser has no graphics
                acceleration, the chat quietly falls back to a much smaller model that runs on the
                processor — slower, but it still works.
              </p>
            </div>
          </WaCard>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="gauge-high" />
              <h2 className="odc-card-heading">What to expect</h2>
            </div>
            <div className="wa-stack wa-gap-m">
              <Row label="Download" value={`About ${downloadMb} MB, once. Kept in the browser afterwards.`} />
              <Row
                label="Speed"
                value="A few words per second on a tablet; considerably quicker on a desktop."
              />
              <Row
                label="Quality"
                value="Noticeably better conversation than the smallest models, still a 1-billion-parameter model — keep questions short and concrete."
              />
              <Row label="Privacy" value="Nothing you type leaves the device." />
              <Row
                label="Offline"
                value="Once downloaded it answers with no connection at all."
              />
            </div>
          </WaCard>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="list-ol" />
              <h2 className="odc-card-heading">How to try it</h2>
            </div>
            <div className="wa-stack wa-gap-m">
              <ol className="wa-stack wa-gap-xs">
                <li>
                  Open <Link to="/">the chat</Link> and pass the short human check.
                </li>
                <li>Choose &quot;Llama 3.2 1B Instruct&quot; in the model picker.</li>
                <li>
                  Wait for the one-time download — on a fast connection this is a couple of minutes.
                </li>
                <li>Ask it something. Everything after that happens on your device.</li>
              </ol>
              <p className="odc-meta">
                On a mobile connection it is worth waiting for Wi-Fi: the download is the same size
                either way.
              </p>
            </div>
          </WaCard>

          <WaCallout variant="brand" appearance="outlined">
            <WaIcon slot="icon" name="circle-info" />
            <strong>Other models on the same page</strong>
            <p>
              The picker also offers Qwen2.5 0.5B for the fastest start, Qwen2.5 1.5B as a stronger
              all-rounder, and Phi-4 mini for the most capable answers on a recent desktop.
            </p>
          </WaCallout>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
