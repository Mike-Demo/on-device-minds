# Browser-Only AI Demo

A single page that downloads a small language model into the browser and runs it entirely on the device. No server, no API key, nothing sent anywhere.

## What you'll see

1. **Landing state** — a short explanation, a hardware check (does this device support on-device acceleration?), and a "Load model" button showing the download size.
2. **Loading state** — a progress bar with percentage and megabytes downloaded, plus a note that the model is cached so the next visit is instant.
3. **Chat state** — a simple chat box. You type, the answer streams in word by word, generated on your own machine.
4. **Live stats** — tokens per second, whether it's using the graphics chip or falling back to slower processing, and a plain-language note that the Neural Engine isn't reachable from a browser.

Unsupported browsers (e.g. older Safari) get a clear message instead of a broken page.

## Model choice

A small instruction-tuned model in the 0.5B–1.5B range, quantized so the download stays a few hundred megabytes. Good enough for conversation, summarizing, and rewriting; not for hard reasoning. The page says so honestly.

## Notes on the Neural Engine

The demo will report what it actually uses. On an iPad Pro that's the GPU via WebGPU — fast, but not the Neural Engine, which no browser exposes today. The stats panel makes this visible rather than claiming otherwise.

## Technical approach

- WebLLM (`@mlc-ai/web-llm`) for in-browser inference over WebGPU, loaded lazily and client-side only — never imported into the server bundle.
- Feature detection via `navigator.gpu` before offering to load; graceful fallback message otherwise.
- Model weights fetched from the MLC CDN and cached in the browser's Cache Storage, so repeat visits skip the download.
- Inference runs in a Web Worker so the UI stays responsive during generation.
- Engine lifecycle (load, progress callback, streaming completion, teardown) lives in a hook/service module, separate from the presentation components.
- Built as the home route (`src/routes/index.tsx`), replacing the placeholder, with its own page title and description.
- shadcn/ui + Tailwind, mobile-first, dark-friendly via existing design tokens.

## Risks

- First load is a large download on mobile data — the page states the size before starting.
- iOS Safari WebGPU support varies by version; the hardware check handles this.
- Generation speed on a phone will be noticeably slower than on a laptop.
