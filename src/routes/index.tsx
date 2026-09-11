import { ClientOnly, Link, createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useEffect } from "react";

import { InstallApp } from "@/components/install-app";
import { warmChatChunk } from "@/lib/prefetch";

import "@/components/on-device-chat.css";

import {
  SiteFooter,
  WaSpinner,
  WebAwesomeLoader,
} from "@/design-system/font-awsome-web-awesome-171158";

const OnDeviceChat = lazy(() =>
  import("@/components/on-device-chat").then((m) => ({ default: m.OnDeviceChat })),
);

const title = "On-device AI — a language model running in your browser";
const description =
  "Run a small language model right inside your browser. No server, no API key — the chat happens entirely on your own device.";

const SITE_URL = "https://ai.mikedemo.dev";

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "On-device AI",
  url: SITE_URL,
  description,
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "On-device AI chat",
  url: SITE_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any modern web browser",
  description,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(siteJsonLd) },
      { type: "application/ld+json", children: JSON.stringify(appJsonLd) },
    ],
  }),
  component: Index,
});

function Loading() {
  return (
    <div className="odc-shell wa-cluster wa-gap-s wa-align-items-center">
      <WaSpinner />
      <span>Loading…</span>
    </div>
  );
}

function Index() {
  useEffect(() => warmChatChunk(), []);

  return (
    <>
      <WebAwesomeLoader />
      <main>
        <ClientOnly fallback={<Loading />}>
          <Suspense fallback={<Loading />}>
            <OnDeviceChat />
          </Suspense>
        </ClientOnly>
        <div className="odc-shell wa-stack wa-gap-s">
          <ClientOnly fallback={null}>
            <InstallApp />
          </ClientOnly>
        </div>
        <div className="odc-shell wa-cluster wa-gap-m">
          <Link to="/faq" className="odc-meta">
            Questions and troubleshooting
          </Link>
          <Link to="/neural-engine" className="odc-meta">
            Why the Neural Engine isn&apos;t used
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
