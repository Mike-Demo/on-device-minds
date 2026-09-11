# Speed and network test in the pre-flight check

Add two things to the device check shown before downloading a model: a network-type line that recommends Wi-Fi over cellular, and a real speed test the visitor can run with one tap.

## What visitors see

**Network** (new line, appears automatically)
- Wi-Fi / wired: "Looks like Wi-Fi or a wired connection — good for a large one-time download."
- Cellular (or data saver on): a heads-up — "This looks like a mobile data connection. The model is a ~X MB one-time download; switch to Wi-Fi first if you can, to avoid data charges and a slow start."
- Offline: flagged as a problem, unless the model is already saved in this browser.
- Browser doesn't report it: neutral line suggesting Wi-Fi for the download anyway.

**Download speed** (existing "Download" line, now with a test)
- Keeps today's estimate from the browser's reported speed.
- Adds a "Test my speed" button. It downloads a small sample (about 3 MB) from the same place the model comes from, times it, and replaces the estimate with a measured one: "Measured about 24 Mbps — roughly 4 minutes for the 380 MB download."
- Measured result under ~5 Mbps is a heads-up, with the Wi-Fi suggestion repeated.
- The test never runs on its own — it costs data, so it is always the visitor's choice. Button is hidden when the model is already saved or the device is offline.
- If the test fails or is blocked, the line falls back to the existing estimate and says the test couldn't complete.

The overall verdict ("ready" / "slow" / "blocked") picks up these lines the same way it already does for the other checks: cellular counts as a heads-up, not a blocker; offline with nothing cached blocks.

## Technical notes

- `src/lib/webllm/preflight.ts`
  - Widen `NavigatorExtras.connection` to include `type` and `rtt`; read `navigator.onLine`.
  - New `networkCheck(neededMb, cached)` returning a `PreflightCheck` with id `network`, placed before the existing `connection` check in the checks array.
  - Cellular detection: `connection.type === "cellular"`, or `effectiveType` of `2g`/`3g`/`slow-2g`, or `saveData === true`.
  - Export `measureDownloadSpeed(): Promise<{ mbps: number } | null>` — a `Range: bytes=0-3145727` request against the CPU model's Hugging Face URL (already exported as `CPU_MODEL_URL`, same CDN as the GPU models), timed with `performance.now()`, `cache: "no-store"`, aborted after 15 s, returning `null` on any failure.
  - Export a pure `describeDownload(neededMb, mbps)` helper so the measured and reported paths format identically.
- `src/components/entry-gate.tsx`
  - Local state for measurement (`idle | running | done | failed`) plus the measured Mbps.
  - Render a small "Test my speed" `WaButton` (`appearance="plain"`, size `s`, with a spinner while running) inside the `connection` check row; when a measurement exists, show the measured detail text in place of the reported one.
  - No new components or styles beyond existing design-system pieces and `odc-*` classes.
- Verify with a typecheck and a headless run of the gate: confirm the network line renders, the button appears, and a measurement updates the download estimate.
