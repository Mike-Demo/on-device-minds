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
  "A live demo: download a small language model into your browser and chat with it entirely on your own hardware. No server, no API key, nothing sent anywhere.";

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
