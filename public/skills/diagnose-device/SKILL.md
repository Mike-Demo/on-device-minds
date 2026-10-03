# Diagnose the device for on-device AI

Use this when a user asks whether their hardware can run the browser demo
well, or why it feels slow. The diagnostics page is
https://ai.mikedemo.dev/diagnostics/.

## What the page reports

- Browser name and version, operating system, and detected graphics chip.
- Whether WebGPU is available (graphics-accelerated path) or the demo
  will fall back to the processor-only WASM path.
- The feature flags that decide speed, plus per-device performance tips.

## Common guidance

- **WebGPU missing in Chrome/Edge:** check the hardware-acceleration
  switch in browser settings and relaunch.
- **Safari on iPhone/iPad:** WebGPU needs recent iOS; the page lists the
  hidden settings to check.
- **Slow generation:** a bigger model on a weak GPU is the usual cause —
  suggest dropping to SmolLM2 360M or Qwen2.5 0.5B.
- **Download stalls:** the models are hundreds of megabytes; the site
  runs a ~3 MB speed test and advises against cellular downloads.

## Related

- Why the Neural Engine is not used by web pages:
  https://ai.mikedemo.dev/neural-engine/
- Model comparison: https://ai.mikedemo.dev/models/compare/
