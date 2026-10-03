# Questions and troubleshooting — On-device AI

How on-device chat works, privacy guarantees, model downloads, and
troubleshooting. Full page: https://ai.mikedemo.dev/faq/

## Questions answered

- What is actually happening when I chat here?
- Why is the first use such a big download?
- Where is the model stored, and how do I remove it?
- Is my conversation private?
- Does it work without internet?
- Which browsers and devices work best?
- Can I install this on my home screen? What does installing change?
- Why is there a check before the download starts?
- What if the check fails or never appears?
- Why does it say it is running on the processor?
- Why is it so much slower?
- Does it start downloading before I press the button?
- Can I choose which mode is used?
- Why isn't the Neural Engine used on an iPad?

## Key answers

**What is happening when I chat here?** A small language model runs
inside the browser page itself — WebGPU for graphics-accelerated models
(via WebLLM), or the processor via WebAssembly (via wllama) where no
graphics acceleration is available.

**Is my conversation private?** Yes. Everything runs on your own
hardware; no chat content is sent to any server.

**Does it work without internet?** After the one-time model download,
yes — the cached model works offline.

**Why the big first download?** Model weights are hundreds of megabytes
(SmolLM2 360M ~270 MB up to Phi-4 mini ~2.3 GB). The site warns about
metered connections and runs an optional speed test first.

## Related pages

- [Chat](https://ai.mikedemo.dev/)
- [Compare the models](https://ai.mikedemo.dev/models/compare/)
- [Check this device](https://ai.mikedemo.dev/diagnostics/)
- [Why the Neural Engine isn't used](https://ai.mikedemo.dev/neural-engine/)
