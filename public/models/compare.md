# Compare the models — On-device AI

Side-by-side comparison of the models available in the browser demo:
size, download, and speed trade-offs.
Full page: https://ai.mikedemo.dev/models/compare/

## The lineup

| Model | Approx. download | Notes |
| --- | --- | --- |
| SmolLM2 360M Instruct | ~270 MB | Processor-only fallback; smallest, fastest download |
| Qwen2.5 0.5B Instruct | ~380 MB | Sweet spot for quick tries; WebGPU or CPU |
| Llama 3.2 1B Instruct | ~880 MB | Better writing; wants WebGPU |
| Qwen2.5 1.5B Instruct | ~1090 MB | Stronger reasoning; needs a capable GPU |
| Phi-4 mini Instruct | ~2300 MB | Best quality of the set; needs a strong GPU |

## How to choose

- No WebGPU or a metered connection: SmolLM2 360M or Qwen2.5 0.5B.
- Modern laptop with WebGPU and broadband: Llama 3.2 1B or
  Qwen2.5 1.5B.
- Beefy desktop GPU: Phi-4 mini.

## No graphics acceleration?

The processor-only path (wllama, WebAssembly) runs on devices without
usable WebGPU — older laptops and iPads included. It is slower, so
stick to the smaller models there.

## Related pages

- [Chat](https://ai.mikedemo.dev/)
- [Run Llama 3 in your browser](https://ai.mikedemo.dev/models/llama-3-in-browser/)
- [Check this device](https://ai.mikedemo.dev/diagnostics/)
- [Open source & credits](https://ai.mikedemo.dev/licenses/)
