# Privacy — On-device AI

What the On-device AI demo collects (almost nothing), where model
downloads come from, and what stays on your device.
Full page: https://ai.mikedemo.dev/privacy/

## Your chats stay yours

Chat inference runs entirely in your browser — on your graphics chip
via WebGPU or on your processor via WebAssembly. No chat content is
sent to any server, because there is no server involved in chatting.
No accounts, no API keys, no analytics events recording what you type.

## What does leave the device

Two things, both ordinary web traffic:

1. The static files of the site itself (HTML, scripts, icons), served
   by the host, which keeps standard server logs.
2. The one-time model download from Hugging Face (huggingface.co and
   its file hosts). After that, the model is cached in the browser and
   repeat visits work offline.

## What is stored, and how to remove it

Model weights live in the browser's own storage (Cache Storage / Origin
Private File System, depending on the browser). Clear the site's data
in your browser settings to remove them — the FAQ
(https://ai.mikedemo.dev/faq/) explains where to look per browser.
Uninstalling the home-screen app does not automatically clear the
cached model.

## Related pages

- [FAQ and troubleshooting](https://ai.mikedemo.dev/faq/)
- [About](https://ai.mikedemo.dev/about/)
- [Contact](https://ai.mikedemo.dev/contact/)
