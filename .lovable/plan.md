# App logo, favicon and header mark

Create a single brand mark that matches the attached idea: a rounded browser/window frame with a
connected-nodes graph inside it — "a neural network running inside the page", which is exactly what
this app is.

## The mark

Both shapes come from Font Awesome Free, so nothing new is licensed:

- outer shape: the window/browser frame
- inner shape: the connected-nodes graph, centered inside the frame

Colors follow the app's existing style: the mark uses the app's brand color for the nodes and the
app's neutral surface/text colors for the frame, so it looks correct in both light and dark mode.
No new colors are invented.

## Where it appears

1. **Header** — a small mark next to the page title on the home page and on the Neural Engine page,
   sized to match the heading, with the title staying the real page heading.
2. **Favicon** — the same mark exported as a square icon for the browser tab, replacing the current
   default Lovable icon.
3. **Licenses page** — no change needed; Font Awesome Free is already credited.

## Technical notes

- New `src/components/brand-mark.tsx`: an inline SVG composed of the two Font Awesome Free glyph
  paths, colored via `--wa-*` design tokens (`currentColor` for the frame, brand token for the
  nodes), with `role="img"` and a label. Inline SVG rather than two stacked `<wa-icon>` elements so
  the two shapes can be precisely composed and reused at any size.
- Header usage: wrap the existing `<h1>` and the mark in a `wa-cluster` in
  `src/components/on-device-chat.tsx` and `src/routes/neural-engine.tsx`; headings themselves are
  unchanged so the SEO heading structure stays valid.
- Favicon: render the same mark to `public/favicon.svg` (static, brand-colored variant), point
  `src/routes/__root.tsx` `head().links` at it, and remove `public/favicon.ico`.
- Minor CSS in `src/components/on-device-chat.css` for mark sizing only, using spacing/size tokens.
