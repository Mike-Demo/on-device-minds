# A page explaining the hardware limits

Add a second page, `/neural-engine`, that answers the question honestly: why the chat on the home page runs on the graphics chip and not the iPad Pro's Neural Engine, and what a native app would change.

## What the page says

1. **Short answer up top** — browsers can only reach the graphics chip. The Neural Engine is reserved for native apps, so no web page on any device can use it today.
2. **What the demo actually uses** — the same live hardware readout as the home page: graphics chip status, adapter name, and the note that no browser exposes a neural accelerator.
3. **Why** — Apple exposes the Neural Engine only through Core ML, which is a native-app interface. Safari and Chrome expose the graphics chip through WebGPU instead.
4. **What a native wrapper would change** — an iPad app could host this same chat page in a web view and answer through Apple's built-in on-device model, running on the Neural Engine. Faster, lower battery use, no download. The trade-off: it only works inside that app, it needs a Mac and an Apple developer account to build and ship, and it can't be built or run from here.
5. **What's coming** — a web standard (WebNN) is meant to open neural accelerators to web pages eventually; it isn't available in Safari today.
6. **Honest scoreboard** — a small comparison of browser vs native: what runs the model, speed, download size, privacy, and how you install it.

## Where it lives

- New page at `/neural-engine`, with its own title and description.
- A link to it from the hardware panel on the home page, worded as "Why not the Neural Engine?".
- The standard footer at the bottom, same as the other pages.

## Technical notes

- New route file `src/routes/neural-engine.tsx` following the pattern in `src/routes/licenses.tsx` and `src/routes/index.tsx`: own `head()` metadata, `WebAwesomeLoader`, `SiteFooter`.
- Content built from existing Web Awesome components (`WaCard`, `WaCallout`, `WaBadge`, `WaIcon`, `WaDivider`) — no new components and no new styles beyond the existing `odc-*` classes.
- The live hardware readout reuses `useOnDeviceChat`'s device inspection via the existing `DevicePanel`, rendered client-side only (it reads browser hardware), or a lighter read of `inspectDevice` if the stats rows aren't wanted there.
- Home-page link added inside `DevicePanel` as a TanStack `Link`.
- No native code, no build tooling changes, no backend.
