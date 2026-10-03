# Device diagnostics — On-device AI

Names the visitor's browser, OS, and graphics chip, lists the features
that decide speed, and gives per-device tips.
Full page: https://ai.mikedemo.dev/diagnostics/

## What it reports

- Browser name and version, operating system, detected graphics chip.
- Whether WebGPU is available (graphics-accelerated path) or the demo
  falls back to the processor-only WASM path.
- The feature flags that decide inference speed, with per-device
  performance tips — including Safari on iPhone/iPad hidden settings and
  the hardware-acceleration switch in Chrome/Edge.

## Common fixes

- WebGPU missing in Chrome/Edge: enable hardware acceleration in
  browser settings and relaunch.
- Slow generation: a big model on a weak GPU is the usual cause — drop
  to SmolLM2 360M or Qwen2.5 0.5B.
- Download stalls: models are hundreds of megabytes; avoid cellular
  connections.

## Related pages

- [Chat](https://ai.mikedemo.dev/)
- [Compare the models](https://ai.mikedemo.dev/models/compare/)
- [Why the Neural Engine isn't used](https://ai.mikedemo.dev/neural-engine/)
- [Questions and troubleshooting](https://ai.mikedemo.dev/faq/)
