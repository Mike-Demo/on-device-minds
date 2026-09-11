import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";

import {
  SiteFooter,
  WaAccordion,
  WaAccordionItem,
  WaCallout,
  WaCard,
  WaDivider,
  WaIcon,
  WebAwesomeLoader,
} from "@/design-system/font-awsome-web-awesome-171158";
import { BrandMark } from "@/components/brand-mark";

import "@/components/on-device-chat.css";

const SITE_URL = "https://ai.mikedemo.dev";

const title = "Questions and troubleshooting — On-device AI demo";
const description =
  "How the in-browser chat works, why there is a human check before the download, and what processor-only mode means on older devices.";

interface FaqEntry {
  readonly question: string;
  /** Plain-text paragraphs; rendered on screen and reused for the structured data. */
  readonly answer: readonly string[];
}

interface FaqGroup {
  readonly heading: string;
  readonly icon: string;
  readonly entries: readonly FaqEntry[];
}

const groups: readonly FaqGroup[] = [
  {
    heading: "The browser chat",
    icon: "comments",
    entries: [
      {
        question: "What is actually happening when I chat here?",
        answer: [
          "The first time you start it, the page downloads a language model into your browser. After that the model runs on your own machine and the replies are produced there.",
          "There is no server answering for you, no account and no API key. Your messages are never sent anywhere.",
        ],
      },
      {
        question: "Why is the first use such a big download?",
        answer: [
          "A language model is a large file of numbers. The smallest one here is about 380 MB, and the largest about 1.1 GB.",
          "It only downloads once. Your browser keeps it, so the next visit starts almost immediately.",
        ],
      },
      {
        question: "Where is the model stored, and how do I remove it?",
        answer: [
          "It sits in your browser's own storage for this site, in the same place a site keeps offline data.",
          "Clearing site data for this address in your browser settings deletes it. Nothing is left on your machine outside the browser.",
        ],
      },
      {
        question: "Is my conversation private?",
        answer: [
          "Yes. The conversation exists only in the page you have open. Reloading clears it, and nothing is stored or transmitted.",
        ],
      },
      {
        question: "Does it work without internet?",
        answer: [
          "Once the page and the model have been saved, yes. You can install the site as an app and open it offline.",
          "The very first download does need a connection.",
        ],
      },
      {
        question: "Which browsers and devices work best?",
        answer: [
          "A recent Chrome, Edge or Safari on a machine with graphics acceleration gives the fastest replies. Firefox support for the graphics path is still arriving.",
          "A desktop or a recent tablet handles the larger models comfortably. Older machines fall back to processor-only mode automatically.",
        ],
      },
    ],
  },
  {
    heading: "The human check",
    icon: "shield-halved",
    entries: [
      {
        question: "Why is there a check before the download starts?",
        answer: [
          "Each visitor who starts the demo pulls several hundred megabytes. The check keeps automated traffic from doing that repeatedly.",
          "It is a single click for a person, and it happens before anything downloads.",
        ],
      },
      {
        question: "What if the check fails or never appears?",
        answer: [
          "Reload the page and try once more. Ad blockers, strict privacy modes and blocked third-party scripts are the usual cause.",
          "If it still does not appear, try another browser or turn the blocker off for this site.",
        ],
      },
    ],
  },
  {
    heading: "Processor-only mode",
    icon: "microchip",
    entries: [
      {
        question: "Why does it say it is running on the processor?",
        answer: [
          "Your browser could not reach the graphics chip, so the page uses the main processor instead. Older laptops, older iPads and some locked-down browsers land here.",
        ],
      },
      {
        question: "Why is it so much slower?",
        answer: [
          "The processor does the same arithmetic without the parallel hardware built for it, so expect a few words per second rather than a flowing reply.",
          "Processor mode uses a single small model of about 380 MB, chosen so the wait stays bearable.",
        ],
      },
      {
        question: "Can I choose which mode is used?",
        answer: [
          "No. The page picks the fastest path your browser can actually use, and tells you which one it chose before you start.",
        ],
      },
      {
        question: "Why isn't the Neural Engine used on an iPad?",
        answer: [
          "No web page can reach the Neural Engine — it is reserved for installed apps. The graphics chip is the fastest route a browser has.",
        ],
      },
    ],
  },
];

interface ToolLink {
  readonly name: string;
  readonly url: string;
  readonly note: string;
}

interface ToolGroup {
  readonly heading: string;
  readonly icon: string;
  readonly links: readonly ToolLink[];
}

const toolGroups: readonly ToolGroup[] = [
  {
    heading: "Browsers",
    icon: "compass",
    links: [
      {
        name: "Google Chrome",
        url: "https://www.google.com/chrome/",
        note: "Broadest support for the graphics path on desktop and Android.",
      },
      {
        name: "Microsoft Edge",
        url: "https://www.microsoft.com/edge",
        note: "Same engine as Chrome, often already installed on Windows.",
      },
      {
        name: "Safari",
        url: "https://www.apple.com/safari/",
        note: "The graphics path works on recent versions of macOS, iPadOS and iOS.",
      },
      {
        name: "Mozilla Firefox",
        url: "https://www.mozilla.org/firefox/new/",
        note: "Works, but the graphics path is still rolling out — expect processor mode.",
      },
    ],
  },
  {
    heading: "Check your device",
    icon: "gauge-high",
    links: [
      {
        name: "WebGPU report",
        url: "https://webgpureport.org/",
        note: "Shows whether your browser can reach the graphics chip at all.",
      },
      {
        name: "Cloudflare Speed Test",
        url: "https://speed.cloudflare.com/",
        note: "Measures the connection carrying that first model download.",
      },
      {
        name: "Fast.com",
        url: "https://fast.com/",
        note: "A quick second opinion on download speed.",
      },
    ],
  },
  {
    heading: "Faster name lookups",
    icon: "network-wired",
    links: [
      {
        name: "Cloudflare 1.1.1.1",
        url: "https://one.one.one.one/",
        note: "A privacy-focused DNS service that often speeds up first connections.",
      },
      {
        name: "Google Public DNS",
        url: "https://developers.google.com/speed/public-dns",
        note: "A widely used alternative with setup guides per device.",
      },
      {
        name: "DNSPerf",
        url: "https://www.dnsperf.com/",
        note: "Compares DNS providers by speed from your region.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: groups.flatMap((group) =>
    group.entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer.join(" ") },
    })),
  ),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Questions", item: `${SITE_URL}/faq` },
  ],
};

export const Route = createFileRoute("/faq")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/faq" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(faqJsonLd) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd) },
    ],
  }),
  component: FaqPage,
});

function FaqPage(): ReactElement {
  return (
    <>
      <WebAwesomeLoader />
      <main>
        <div className="odc-shell wa-stack wa-gap-2xl">
          <header className="wa-stack wa-gap-s">
            <div className="wa-cluster wa-gap-s wa-align-items-center">
              <BrandMark className="odc-brand-mark" />
              <h1>Questions and troubleshooting</h1>
            </div>
            <p className="odc-lede">
              How the chat runs on your own device, why there is a check before the download, and
              what to do when the page tells you it is running on the processor.
            </p>
            <div className="wa-cluster wa-gap-m">
              <Link to="/" className="odc-meta">
                Back to the demo
              </Link>
              <Link to="/neural-engine" className="odc-meta">
                Why the Neural Engine isn&apos;t used
              </Link>
            </div>
          </header>

          {groups.map((group) => (
            <section key={group.heading} className="wa-stack wa-gap-m">
              <div className="wa-cluster wa-gap-xs wa-align-items-center">
                <WaIcon name={group.icon} />
                <h2 className="odc-card-heading">{group.heading}</h2>
              </div>
              <WaAccordion appearance="outlined">
                {group.entries.map((entry) => (
                  <WaAccordionItem key={entry.question} label={entry.question}>
                    <div className="wa-stack wa-gap-s">
                      {entry.answer.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {entry.question.includes("Neural Engine") ? (
                        <Link to="/neural-engine" className="odc-meta">
                          Read the full explanation
                        </Link>
                      ) : null}
                    </div>
                  </WaAccordionItem>
                ))}
              </WaAccordion>
            </section>
          ))}

          <WaCard appearance="outlined" with-header>
            <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
              <WaIcon name="screwdriver-wrench" />
              <h2 className="odc-card-heading">Tools that help</h2>
            </div>
            <div className="wa-stack wa-gap-l">
              {toolGroups.map((group, index) => (
                <div key={group.heading} className="wa-stack wa-gap-s">
                  {index > 0 ? <WaDivider /> : null}
                  <div className="wa-cluster wa-gap-xs wa-align-items-center">
                    <WaIcon name={group.icon} />
                    <strong>{group.heading}</strong>
                  </div>
                  {group.links.map((link) => (
                    <div key={link.url} className="wa-stack wa-gap-3xs">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.name}
                      </a>
                      <span className="odc-meta">{link.note}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </WaCard>

          <WaCallout variant="brand" appearance="outlined">
            <WaIcon slot="icon" name="circle-info" />
            <strong>Still stuck?</strong>
            <p>
              Reload the page, then try a different browser. If the demo still refuses to start, the
              device most likely lacks both graphics acceleration and enough free storage for the
              smallest model.
            </p>
          </WaCallout>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
