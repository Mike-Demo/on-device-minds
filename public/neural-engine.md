# Why the Neural Engine isn't doing the work — On-device AI

Browsers can only reach the graphics chip. Here's why the iPad Pro's
Neural Engine stays out of reach on the web, and what a native app
would change. Full page: https://ai.mikedemo.dev/neural-engine/

## Why the door is closed

The chat on this site runs the model on the graphics chip (WebGPU). The
Neural Engine — the dedicated AI chip in an iPad Pro, iPhone, or Mac —
is reserved for installed apps. No web page, in any browser, can reach
it today.

## What a native app would change

A native app could dispatch work to the Neural Engine through Core ML
or similar platform APIs, unlocking far faster inference per watt. The
trade-off is installation, platform lock-in, and an app-store
distribution step — the opposite of "open a page and chat."

## Side by side

- In this page: model weights run on the GPU via WebGPU, or on the CPU
  via WebAssembly where no GPU path exists.
- In a native app: the same weights could run on the Neural Engine.

## Related pages

- [Chat](https://ai.mikedemo.dev/)
- [Check this device](https://ai.mikedemo.dev/diagnostics/)
- [Questions and troubleshooting](https://ai.mikedemo.dev/faq/)
