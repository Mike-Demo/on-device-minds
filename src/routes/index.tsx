import { ClientOnly, Link, createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useEffect } from "react";

import { BrandMark } from "@/components/brand-mark";
import { InstallApp } from "@/components/install-app";
import { warmChatChunk } from "@/lib/prefetch";
import {
  SITE_NAME,
  WEBSITE_ID,
  pageUrl,
  publisherJsonLd,
  publisherRef,
  websiteRef,
} from "@/lib/seo";


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

const HOME_URL = pageUrl("/");

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE_NAME,
  url: HOME_URL,
  description,
  inLanguage: "en",
  publisher: publisherRef,
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "On-device AI chat",
  url: HOME_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any modern web browser",
  browserRequirements: "Requires a current browser; WebGPU for graphics-accelerated models",
  description,
  isAccessibleForFree: true,
  featureList: [
    "Runs a language model entirely in the browser",
    "No server, account, or API key",
    "Works offline once the model is cached",
    "Processor-only fallback for devices without WebGPU",
    "Installable as a home-screen app",
  ],
  creator: publisherRef,
  isPartOf: websiteRef,
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
      { property: "og:url", content: HOME_URL },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ai.mikedemo.dev/pwa-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: HOME_URL },
      { rel: "alternate", type: "text/markdown", href: "https://ai.mikedemo.dev/index.md" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(publisherJsonLd) },
      { type: "application/ld+json", children: JSON.stringify(siteJsonLd) },
      { type: "application/ld+json", children: JSON.stringify(appJsonLd) },
    ],
  }),
  component: Index,
});


function Loading() {
  return (
    <div className="odc-shell odc-shell-body wa-cluster wa-gap-s wa-align-items-center">
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
        {/* Rendered on the server so the headline is in the HTML immediately,
            before the browser-only chat below it loads. */}
        <header className="odc-shell odc-shell-head wa-stack wa-gap-s">
          <div className="wa-cluster wa-gap-s wa-align-items-center">
            <BrandMark className="odc-brand-mark" />
            <h1>An AI model running inside this page</h1>
          </div>

          <p className="odc-lede">
            Nothing here talks to a server. The model downloads once into this browser and then
            answers on your own hardware — offline, private, and free to run.
          </p>
        </header>

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
          <Link to="/faq/" className="odc-meta">
            Questions and troubleshooting
          </Link>
          <Link to="/models/llama-3-in-browser/" className="odc-meta">
            Run Llama 3 in your browser
          </Link>
          <Link to="/models/compare/" className="odc-meta">
            Compare the models
          </Link>
          <Link to="/diagnostics/" className="odc-meta">
            Check this device
          </Link>
          <Link to="/neural-engine/" className="odc-meta">
            Why the Neural Engine isn&apos;t used
          </Link>
          <Link to="/about" className="odc-meta">
            About this demo
          </Link>
          <Link to="/developers" className="odc-meta">
            For developers
          </Link>
          <Link to="/privacy" className="odc-meta">
            Privacy
          </Link>
          <Link to="/contact" className="odc-meta">
            Contact
          </Link>
        </div>

        {/* Server-rendered explainer so crawlers and agents see real
            content in the raw HTML, before the browser-only chat loads. */}
        <section className="odc-shell wa-stack wa-gap-s" aria-labelledby="how-it-works">
          <h2 id="how-it-works">How the on-device demo works</h2>
          <p>
            A language model is just a very large file of numbers. This
            page downloads one such file — between roughly 270 MB and
            2.3 GB depending on the model you pick — keeps it in the
            browser&apos;s own storage, and then does the math on your
            hardware. With WebGPU the work runs on your graphics chip;
            without it, a WebAssembly build of llama.cpp runs on the
            processor instead. Either way, your words never leave the
            machine.
          </p>
          <p>
            Before any download, the page runs a pre-flight check: it
            looks for graphics acceleration, estimates available memory
            and storage, notes your network type, and can run a small
            speed test so you don&apos;t start a two-gigabyte download
            over a cellular connection by accident. Once the model is
            cached, the demo works offline — the chat is a conversation
            between you and a file on your own disk.
          </p>
          <p>
            The trade-off is capability. These are small models
            (SmolLM2 360M, Qwen2.5 0.5B and 1.5B, Llama 3.2 1B, Phi-4
            mini): they answer quickly and privately, but they know less
            and hallucinate more than the giant models running in data
            centers. If you want to see how they differ, the{" "}
            <Link to="/models/compare">model comparison</Link> lays out
            size and speed; the{" "}
            <Link to="/diagnostics">diagnostics page</Link> tells you
            what your device can handle; and the{" "}
            <Link to="/faq">FAQ</Link> answers the privacy and
            troubleshooting questions in full.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
