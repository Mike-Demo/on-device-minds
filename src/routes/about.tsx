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

const title = "About — On-device AI";
const description =
  "What the On-device AI demo is, why it exists, who made it, and what it deliberately does not do.";

const PAGE_URL = pageUrl("/about");

const jsonLd = articleJsonLd({
  headline: "About On-device AI",
  description,
  path: "/about",
  datePublished: "2026-10-03",
  dateModified: "2026-10-03",
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
]);

const MD_URL = "https://ai.mikedemo.dev/about.md";

export const Route = createFileRoute("/about")({
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

  component: AboutPage,
});

function AboutPage(): ReactElement {
  return (
    <>
      <WebAwesomeLoader />
      <main>
        <div className="odc-shell wa-stack wa-gap-2xl">
          <header className="wa-stack wa-gap-s">
            <div className="wa-cluster wa-gap-s wa-align-items-center">
              <BrandMark className="odc-brand-mark" />
              <h1>About this demo</h1>
            </div>
            <p className="odc-lede">
              On-device AI is a live experiment: a language model running
              entirely inside a web page, with no server, no API key, and
              no account standing between you and it.
            </p>
          </header>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="flask" />
              <h2 className="odc-card-heading">Why it exists</h2>
            </div>
            <p>
              Most AI demos route your words through somebody&apos;s
              server. This one asks a different question: what happens
              when the model lives on your side of the screen? The page
              downloads a small open model once — from a few hundred
              megabytes to a couple of gigabytes — and then chats with it
              locally, token by token, on your own graphics chip or
              processor. Nothing you type leaves the device.
            </p>
            <p>
              It is a demo, not a product pitch. The models are tiny by
              design, so they are quick and private but far less capable
              than a cloud assistant — and they do get things wrong. The
              point is the shape of the thing: private-by-architecture AI
              that works offline once the model is cached.
            </p>
          </WaCard>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="user" />
              <h2 className="odc-card-heading">Who made it</h2>
            </div>
            <p>
              On-device AI is built by MikeDemo (Mike Demopoulos), who
              makes open, privacy-first web experiments. Find him on{" "}
              <a href="https://github.com/Mike-Demo">GitHub</a>,{" "}
              <a href="https://www.linkedin.com/in/mikedemopoulos">LinkedIn</a>,
              and <a href="https://ai.mikedemo.dev/contact/">via the contact page</a>.
            </p>
          </WaCard>

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="ban" />
              <h2 className="odc-card-heading">What it deliberately does not do</h2>
            </div>
            <p>
              There is no account system, no analytics that follows you
              around, no API to key into, and no data collection beyond
              what the static host logs to serve the files. The model
              weights come from their Hugging Face repositories; the
              site&apos;s own code is a static page plus two inference
              libraries (WebLLM for WebGPU, wllama for the CPU fallback).
            </p>
            <div className="wa-cluster wa-gap-xs">
              <Link to="/" className="odc-meta">Try the demo</Link>
              <Link to="/developers" className="odc-meta">For developers</Link>
              <Link to="/privacy" className="odc-meta">Privacy</Link>
              <Link to="/contact" className="odc-meta">Contact</Link>
            </div>
          </WaCard>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
