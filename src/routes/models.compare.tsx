import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import type { ReactElement } from "react";

import { BrandMark } from "@/components/brand-mark";
import { warmChatChunk } from "@/lib/prefetch";
import { articleJsonLd, breadcrumbJsonLd, pageUrl } from "@/lib/seo";
import { CPU_MODELS, ON_DEVICE_MODELS } from "@/lib/webllm/models";

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

const title = "Llama 3.2 vs Qwen 2.5 vs Phi-4 mini in the browser";
const description =
  "Download size, memory needed and speed for the small language models this site runs entirely in your browser — Llama 3.2 1B, Qwen 2.5 and Phi-4 mini, side by side.";

const PAGE_PATH = "/models/compare";
const PAGE_URL = pageUrl(PAGE_PATH);

/**
 * Per-model notes. Download sizes are never repeated here — they come from the
 * same list the chat downloads from, so the two can never drift apart.
 */
interface ModelNote {
  readonly memory: string;
  readonly speed: string;
}

const NOTES: Record<string, ModelNote> = {
  "Qwen2.5-0.5B-Instruct-q4f16_1-MLC": {
    memory: "About 1 GB free memory.",
    speed: "The fastest of the four to download and to answer. Fine on an older tablet.",
  },
  "Llama-3.2-1B-Instruct-q4f16_1-MLC": {
    memory: "About 2 GB free memory.",
    speed: "Roughly half the speed of Qwen 0.5B, and still comfortable on a laptop.",
  },
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC": {
    memory: "About 3 GB free memory.",
    speed: "A little slower again than Llama 3.2 1B. Best on a desktop or a recent tablet.",
  },
  "Phi-4-mini-instruct-q4f16_1-MLC": {
    memory: "About 5 GB free memory.",
    speed: "The slowest to start and to answer. Needs a recent desktop or laptop.",
  },
};

const jsonLd = articleJsonLd({
  headline: "Llama 3.2 vs Qwen 2.5 vs Phi-4 mini in the browser",
  description,
  path: PAGE_PATH,
  datePublished: "2026-09-11",
  dateModified: "2026-09-11",
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Compare the models", path: PAGE_PATH },
]);

const listJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Small language models compared for in-browser use",
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  numberOfItems: ON_DEVICE_MODELS.length,
  itemListElement: ON_DEVICE_MODELS.map((model, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: model.label,
  })),
};

export const Route = createFileRoute("/models/compare")({
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
      { type: "application/ld+json", children: JSON.stringify(listJsonLd) },
    ],
  }),
  component: CompareModelsPage,
});

function formatSize(mb: number): string {
  return mb >= 1000 ? `${(mb / 1000).toFixed(2).replace(/0$/, "")} GB` : `${mb} MB`;
}

function Fact({ label, value }: { readonly label: string; readonly value: string }): ReactElement {
  return (
    <div className="wa-stack wa-gap-3xs">
      <strong>{label}</strong>
      <span className="odc-meta">{value}</span>
    </div>
  );
}

function CompareModelsPage(): ReactElement {
  useEffect(() => warmChatChunk(), []);

  return (
    <>
      <WebAwesomeLoader />
      <main>
        <div className="odc-shell wa-stack wa-gap-2xl">
          <header className="wa-stack wa-gap-s">
            <div className="wa-cluster wa-gap-s wa-align-items-center">
              <BrandMark className="odc-brand-mark" />
              <h1>Compare the models</h1>
            </div>
            <p className="odc-lede">
              The chat on this site offers four models that run on your graphics chip. They differ
              mainly in how much you download once, how much memory they need, and how quickly the
              answers come out.
            </p>
            <div className="wa-cluster wa-gap-xs">
              <Link to="/" className="odc-meta">
                Try them in the chat
              </Link>
              <Link to="/diagnostics" className="odc-meta">
                Check what this device can run
              </Link>
              <Link to="/faq" className="odc-meta">
                Questions and troubleshooting
              </Link>
            </div>
          </header>

          {ON_DEVICE_MODELS.map((model, index) => {
            const note = NOTES[model.id];
            return (
              <WaCard key={model.id} appearance="outlined" with-header>
                <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
                  <WaIcon name="cube" />
                  <h2 className="odc-card-heading">{model.label}</h2>
                  {index === 0 ? (
                    <WaBadge variant="brand" appearance="filled" pill>
                      Default
                    </WaBadge>
                  ) : null}
                </div>
                <div className="wa-stack wa-gap-m">
                  <Fact
                    label="One-time download"
                    value={`${formatSize(model.approxDownloadMb)}, kept in the browser afterwards.`}
                  />
                  <WaDivider />
                  <Fact label="Memory needed" value={note?.memory ?? "Varies by device."} />
                  <WaDivider />
                  <Fact label="Speed" value={note?.speed ?? "Varies by device."} />
                  <WaDivider />
                  <Fact label="Best for" value={model.blurb} />
                </div>
              </WaCard>
            );
          })}

          <WaCallout variant="neutral" appearance="outlined">
            <WaIcon slot="icon" name="gauge-high" />
            <strong>About those speed figures</strong>
            <p>
              There is no honest single number here: the same model can be several times faster on a
              desktop graphics card than on a tablet. The ordering above follows model size, which is
              what actually decides the difference on any one device. The one figure measured on this
              site is for processor-only mode, where the smallest model produces roughly two and a
              half words a second.
            </p>
          </WaCallout>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="hand-pointer" />
              <h2 className="odc-card-heading">How to choose</h2>
            </div>
            <div className="wa-stack wa-gap-m">
              <Fact
                label="Older iPad or laptop"
                value="Start with Qwen2.5 0.5B. It is the quickest to download and the least likely to run out of memory."
              />
              <WaDivider />
              <Fact
                label="An everyday laptop from the last few years"
                value="Llama 3.2 1B is the sweet spot — clearly better conversation for a download you only do once."
              />
              <WaDivider />
              <Fact
                label="Desktop with a good graphics card"
                value="Phi-4 mini gives the most capable answers, with Qwen2.5 1.5B as a lighter middle ground."
              />
            </div>
          </WaCard>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="microchip" />
              <h2 className="odc-card-heading">No graphics acceleration?</h2>
            </div>
            <div className="wa-stack wa-gap-m">
              <p>
                If your browser cannot reach the graphics chip, the chat quietly switches to a much
                smaller model that runs on the processor. Those two are separate from the four above:
              </p>
              {CPU_MODELS.map((model) => (
                <Fact
                  key={model.id}
                  label={model.label}
                  value={`${formatSize(model.approxDownloadMb)} to download. ${model.blurb}`}
                />
              ))}
              <p className="odc-meta">
                <Link to="/diagnostics">The diagnostics page</Link> tells you which path your device
                will take, and what you can change.
              </p>
            </div>
          </WaCard>

          <div className="wa-cluster wa-gap-m">
            <Link to="/models/llama-3-in-browser" className="odc-meta">
              More about Llama 3 in the browser
            </Link>
            <Link to="/neural-engine" className="odc-meta">
              Why the Neural Engine isn&apos;t used
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
