import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useEffect } from "react";

import { warmChatChunk } from "@/lib/prefetch";

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
      </main>
      <SiteFooter />
    </>
  );
}
