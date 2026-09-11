# Add Phi-4-mini to the model picker

Add Microsoft's Phi-4-mini Instruct as a fourth choice in the browser chat's model list, alongside the three existing models.

## What changes for visitors

- The model picker on the home page gains **Phi-4 mini Instruct** — the largest and most capable option.
- It is listed as roughly a 2.3 GB one-time download, described as needing a recent desktop or laptop with graphics acceleration and plenty of memory.
- The existing pre-start checks already warn about download size, storage and memory, so people on small devices see a caution automatically before starting.
- Wording of the current largest model ("Strongest of the three") is adjusted so it stays accurate.
- Processor-only (no graphics acceleration) mode is unchanged: it keeps using the single small model, since Phi-4-mini is far too large to run that way.

## Technical notes

- Add an entry to `ON_DEVICE_MODELS` in `src/lib/webllm/models.ts`:
  - id `Phi-4-mini-instruct-q4f16_1-MLC` (present in the installed WebLLM prebuilt app config)
  - approximate download ~2300 MB
  - label and blurb per above
- Default model stays Qwen2.5 0.5B; ordering keeps smallest first, Phi-4-mini last.
- No other code changes needed — the picker, preflight (`storageCheck`, `memoryCheck`, `connectionCheck`), loading, streaming and caching all read from this list.
- Verify with a typecheck and a headless load of the picker to confirm the new option renders and the size/warning copy is right; a full 2.3 GB download will not be run in the sandbox.
