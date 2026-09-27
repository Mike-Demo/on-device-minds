import { createFileRoute } from "@tanstack/react-router";

import {
  LicensesPage,
  SiteFooter,
  WebAwesomeLoader,
} from "@/design-system/font-awsome-web-awesome-171158";
import { baseCredits } from "@/design-system/font-awsome-web-awesome-171158/webawesome/patterns/licenses";
import { breadcrumbJsonLd, pageUrl, webPageJsonLd } from "@/lib/seo";

const title = "Open source & credits — On-device AI demo";
const description =
  "The open-source libraries, models, and design system behind this browser-based AI demo.";

const PAGE_URL = pageUrl("/licenses");

const pageJsonLd = webPageJsonLd({ name: title, description, path: "/licenses" });

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Open source & credits", path: "/licenses" },
]);

export const Route = createFileRoute("/licenses")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: PAGE_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(pageJsonLd) },
      { type: "application/ld+json", children: JSON.stringify(crumbsJsonLd) },
    ],
  }),
  component: Licenses,
});


function Licenses() {
  return (
    <>
      <WebAwesomeLoader />
      <main>
        <LicensesPage
          lede="This demo runs a language model entirely in your browser. Everything it depends on is credited below."
          groups={[
            {
              title: "Open source",
              entries: [
                {
                  name: "On-device AI demo (this site)",
                  author: "MikeDemo",
                  license: "No license declared",
                  url: "https://github.com/Mike-Demo/on-device-minds",
                  note: "This site's source code is on GitHub.",
                },
              ],
            },
            {
              title: "Open source libraries",
              entries: [
                ...baseCredits,
                {
                  name: "Radix UI",
                  author: "WorkOS",
                  license: "MIT",
                  url: "https://github.com/radix-ui/primitives/blob/main/LICENSE",
                  note: "Unstyled UI primitives.",
                },
                {
                  name: "Lucide",
                  author: "Lucide contributors",
                  license: "ISC",
                  url: "https://github.com/lucide-icons/lucide/blob/main/LICENSE",
                  note: "Icon components.",
                },
              ],
            },
            {
              title: "On-device inference",
              entries: [
                {
                  name: "WebLLM",
                  author: "MLC AI",
                  license: "Apache 2.0",
                  url: "https://github.com/mlc-ai/web-llm",
                  note: "Runs the language model in the browser over WebGPU.",
                },
                {
                  name: "Qwen2.5 Instruct (0.5B, 1.5B)",
                  author: "Alibaba Cloud / Qwen team",
                  license: "Apache 2.0",
                  url: "https://huggingface.co/Qwen",
                  note: "Model weights served from the MLC model registry.",
                },
                {
                  name: "Llama 3.2 1B Instruct",
                  author: "Meta",
                  license: "Llama 3.2 Community License",
                  url: "https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE",
                  note: "Optional model choice in the demo.",
                },
                {
                  name: "wllama",
                  author: "Xuan-Son Nguyen",
                  license: "MIT",
                  url: "https://github.com/ngxson/wllama",
                  note: "Runs the model on the processor when graphics acceleration is unavailable.",
                },
                {
                  name: "llama.cpp",
                  author: "Georgi Gerganov and contributors",
                  license: "MIT",
                  url: "https://github.com/ggml-org/llama.cpp",
                  note: "The inference engine wllama compiles to WebAssembly.",
                },
                {
                  name: "Qwen2.5-0.5B-Instruct GGUF",
                  author: "Alibaba Cloud / Qwen team, quantised by bartowski",
                  license: "Apache 2.0",
                  url: "https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF",
                  note: "The model used in processor-only mode.",
                },
              ],
            },
          ]}
        />
      </main>
      <SiteFooter />
    </>
  );
}
