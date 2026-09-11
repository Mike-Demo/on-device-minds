import { createFileRoute } from "@tanstack/react-router";

import {
  LicensesPage,
  SiteFooter,
  WebAwesomeLoader,
} from "@/design-system/font-awsome-web-awesome-171158";
import { baseCredits } from "@/design-system/font-awsome-web-awesome-171158/webawesome/patterns/licenses";

const title = "Open source & credits — On-device AI demo";
const description =
  "The open-source libraries, models, and design system behind this browser-based AI demo.";

export const Route = createFileRoute("/licenses")({
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
            { title: "Open source libraries", entries: baseCredits },
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
              ],
            },
            {
              title: "Services",
              entries: [
                {
                  name: "hCaptcha",
                  author: "Intuition Machines, Inc.",
                  license: "Proprietary service",
                  url: "https://www.hcaptcha.com/",
                  note: "Bot protection on the pre-flight gate before a model download.",
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
