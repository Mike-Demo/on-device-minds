# About — On-device AI

On-device AI is a live experiment: a language model running entirely
inside a web page, with no server, no API key, and no account standing
between you and it. Full page: https://ai.mikedemo.dev/about/

## Why it exists

Most AI demos route your words through somebody's server. This one asks
a different question: what happens when the model lives on your side of
the screen? The page downloads a small open model once and then chats
with it locally, token by token, on your own graphics chip or
processor. Nothing you type leaves the device.

It is a demo, not a product pitch. The models are tiny by design — quick
and private, but far less capable than a cloud assistant, and they do
get things wrong. The point is the shape of the thing:
private-by-architecture AI that works offline once the model is cached.

## Who made it

On-device AI is built by MikeDemo (Mike Demopoulos), who makes open,
privacy-first web experiments: https://github.com/Mike-Demo,
https://www.linkedin.com/in/mikedemopoulos.

## What it deliberately does not do

No account system, no analytics that follows you around, no API to key
into, and no data collection beyond what the static host logs to serve
the files. Model weights come from their Hugging Face repositories; the
site's own code is a static page plus two inference libraries (WebLLM
for WebGPU, wllama for the CPU fallback).

## Related pages

- [Chat](https://ai.mikedemo.dev/)
- [For developers](https://ai.mikedemo.dev/developers/)
- [Privacy](https://ai.mikedemo.dev/privacy/)
- [Contact](https://ai.mikedemo.dev/contact/)
