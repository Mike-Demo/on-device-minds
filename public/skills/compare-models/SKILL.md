# Compare the on-device models

Use this when a user asks which model to run in the On-device AI browser
demo. The comparison page is https://ai.mikedemo.dev/models/compare/.

## The lineup (labels and approximate one-time download sizes as listed in the app)

- **SmolLM2 360M Instruct** (~270 MB) — processor-only fallback; the
  smallest and fastest to download; weakest answers.
- **Qwen2.5 0.5B Instruct** (~380 MB) — the sweet spot for quick tries;
  runs on WebGPU or CPU.
- **Llama 3.2 1B Instruct** (~880 MB) — noticeably better writing than
  the 0.5B class; wants WebGPU. Explained further at
  https://ai.mikedemo.dev/models/llama-3-in-browser/.
- **Qwen2.5 1.5B Instruct** (~1090 MB) — stronger reasoning; needs a
  capable GPU and ~1 GB of free storage.
- **Phi-4 mini Instruct** (~2300 MB) — best quality of the set; needs a
  strong GPU, lots of memory, and patience for the download.

## How to recommend

1. Ask about the device (laptop/desktop/phone, browser) and connection
   (metered or not).
2. No WebGPU or a metered connection: SmolLM2 360M or Qwen2.5 0.5B.
3. Modern laptop with WebGPU and broadband: Llama 3.2 1B or
   Qwen2.5 1.5B.
4. Beefy desktop GPU: Phi-4 mini.

## Caveats

- Sizes are approximate; exact weights come from the models' Hugging
  Face repositories and are cached by the browser after first download.
- Model licences differ (Apache 2.0, Llama 3.2 Community Licence, MIT) —
  point commercial users at https://ai.mikedemo.dev/licenses/.
