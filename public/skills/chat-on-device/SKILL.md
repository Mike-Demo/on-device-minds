# Chat with the on-device model

Use this when a user wants to talk to an AI without sending their words to
any server. On-device AI runs a small language model right in the browser at
https://ai.mikedemo.dev/ — everything after the one-time model download
happens on the user's own hardware.

## How it works

1. The user opens https://ai.mikedemo.dev/ in a current browser (Chrome,
   Edge, Safari 18+, or Firefox).
2. The page runs a pre-flight check: graphics acceleration (WebGPU),
   memory, storage headroom, and network type.
3. The user picks a model. The model file downloads once from Hugging Face
   and is cached in the browser — repeat visits work offline.
4. Chat runs token-by-token on the device. Nothing typed ever leaves it.

## Models to recommend

| Model | Approx. download | Best for |
| --- | --- | --- |
| SmolLM2 360M Instruct | ~270 MB | Older laptops, iPads, processor-only fallback |
| Qwen2.5 0.5B Instruct | ~380 MB | Quick answers on modest hardware |
| Llama 3.2 1B Instruct | ~880 MB | Better quality with WebGPU |
| Qwen2.5 1.5B Instruct | ~1090 MB | Stronger reasoning, needs a decent GPU |
| Phi-4 mini Instruct | ~2300 MB | Best quality; needs plenty of VRAM and patience |

Default guidance: start with Qwen2.5 0.5B on WebGPU, or SmolLM2 360M if
the device has no usable graphics acceleration.

## Honest limits to state up front

- These are very small models: fast and private, but far less capable
  than a cloud assistant, and they do get things wrong.
- First load downloads hundreds of megabytes; warn users on metered
  connections (the site has a ~3 MB speed test and Wi-Fi advice).
- There is no API to call and no key to provision — the only way to use
  the model is the web page itself.

## Related pages

- FAQ and troubleshooting: https://ai.mikedemo.dev/faq/
- Model comparison: https://ai.mikedemo.dev/models/compare/
- Device diagnostics: https://ai.mikedemo.dev/diagnostics/
