import { ClientOnly, Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import type { ReactElement, ReactNode } from "react";

import { warmChatChunk } from "@/lib/prefetch";
import { articleJsonLd, breadcrumbJsonLd, pageUrl } from "@/lib/seo";


import {
  SiteFooter,
  WaBadge,
  WaCallout,
  WaCard,
  WaDivider,
  WaIcon,
  WebAwesomeLoader,
} from "@/design-system/font-awsome-web-awesome-171158";
import { BrandMark } from "@/components/brand-mark";
import { NeuralEngineReadout } from "@/components/neural-engine-readout";

import "@/components/on-device-chat.css";

const title = "Why the Neural Engine isn't used — On-device AI demo";
const description =
  "Browsers can only reach the graphics chip. Here's why the iPad Pro's Neural Engine stays out of reach on the web, and what a native app would change.";

const PAGE_URL = pageUrl("/neural-engine");

const jsonLd = articleJsonLd({
  headline: "Why the Neural Engine isn't used by a web page",
  description,
  path: "/neural-engine",
  datePublished: "2026-08-20",
  dateModified: "2026-09-11",
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Why the Neural Engine isn't used", path: "/neural-engine" },
]);

export const Route = createFileRoute("/neural-engine")({
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

  component: NeuralEnginePage,
});

interface RowProps {
  readonly label: string;
  readonly browser: ReactNode;
  readonly native: ReactNode;
}

function Row({ label, browser, native }: RowProps): ReactElement {
  return (
    <>
      <WaDivider />
      <div className="wa-stack wa-gap-3xs">
        <strong>{label}</strong>
        <span className="odc-meta">In this page: {browser}</span>
        <span className="odc-meta">In a native app: {native}</span>
      </div>
    </>
  );
}

function NeuralEnginePage(): ReactElement {
  useEffect(() => warmChatChunk(), []);

  return (
    <>
      <WebAwesomeLoader />
      <main>
        <div className="odc-shell wa-stack wa-gap-2xl">
          <header className="wa-stack wa-gap-s">
            <div className="wa-cluster wa-gap-s wa-align-items-center">
              <BrandMark className="odc-brand-mark" />
              <h1>Why the Neural Engine isn&apos;t doing the work</h1>
            </div>

            <p className="odc-lede">
              The chat on this site runs the model on your graphics chip. The Neural Engine — the
              dedicated AI chip in an iPad Pro, iPhone, or Mac — is reserved for installed apps. No
              web page, in any browser, can reach it today.
            </p>
            <div className="wa-cluster wa-gap-xs">
              <Link to="/" className="odc-meta">
                Back to the demo
              </Link>
              <Link to="/faq/" className="odc-meta">
                Questions and troubleshooting
              </Link>
            </div>
          </header>

          <ClientOnly fallback={null}>
            <NeuralEngineReadout />
          </ClientOnly>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="circle-question" />
              <h2 className="odc-card-heading">Why the door is closed</h2>
            </div>
            <div className="wa-stack wa-gap-m">
              <p>
                Apple only lets software use the Neural Engine through Core ML, which is an interface
                for installed apps. Safari deliberately does not pass that through to web pages —
                partly for security, partly because there is no agreed web standard for it yet.
              </p>
              <p>
                What browsers do offer is the graphics chip, through a standard called WebGPU. That is
                genuinely fast and it is what this demo uses. It just isn&apos;t the specialised chip
                sitting next to it.
              </p>
              <div className="wa-cluster wa-gap-xs">
                <WaBadge variant="success" appearance="filled" pill>
                  Graphics chip: open to web pages
                </WaBadge>
                <WaBadge variant="neutral" appearance="outlined" pill>
                  Neural Engine: apps only
                </WaBadge>
              </div>
            </div>
          </WaCard>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="mobile-screen" />
              <h2 className="odc-card-heading">What a native app would change</h2>
            </div>
            <div className="wa-stack wa-gap-m">
              <p>
                An iPad app could show this exact chat page inside itself and answer using the
                on-device model built into recent versions of iPadOS. That model runs on the Neural
                Engine: quicker replies, less battery drain, and no multi-hundred-megabyte download,
                because the model is already on the device.
              </p>
              <p className="odc-meta">
                The trade-offs: it only works for people who install the app, it needs a Mac, Xcode
                and an Apple developer account to build and submit, and it can&apos;t be produced from
                a web project like this one. The web version, meanwhile, works on any machine with a
                modern browser and needs nothing installed.
              </p>
            </div>
          </WaCard>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="scale-balanced" />
              <h2 className="odc-card-heading">Side by side</h2>
            </div>
            <div className="wa-stack wa-gap-m">
              <Row label="What runs the model" browser="Graphics chip" native="Neural Engine" />
              <Row
                label="Speed"
                browser="Usable, a few words per second on a tablet"
                native="Noticeably faster, and easier on the battery"
              />
              <Row
                label="Download"
                browser="380 MB to 1.1 GB the first time"
                native="Nothing — the model ships with the system"
              />
              <Row
                label="Privacy"
                browser="Nothing leaves the device"
                native="Nothing leaves the device"
              />
              <Row
                label="How you get it"
                browser="Open a link"
                native="Install from the App Store"
              />
            </div>
          </WaCard>

          <WaCallout variant="brand" appearance="outlined">
            <WaIcon slot="icon" name="road" />
            <strong>This may change</strong>
            <p>
              A proposed web standard called WebNN would let pages use neural accelerators directly.
              It is being trialled in some browsers, but Safari does not support it today — so on an
              iPad, the graphics chip remains the fastest route a web page has.
            </p>
          </WaCallout>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
