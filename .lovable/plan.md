# Fix the human check and the Send button

Two things are broken on the live site, and the uploaded research doc suggests a few worthwhile follow-ups.

## 1. The human check behaves backwards

Today the gate treats "no site key came back from the server" as "you're human, go ahead", so the check can be skipped entirely. And when someone does pass the box, the result depends on a second server call that can fail or expire silently, leaving the Continue button dead with no explanation.

Changes:

- Never let a missing or failed check count as a pass. If the check can't load, say so on screen and offer a Try again button instead of quietly opening the gate.
- Show a plain reason next to Continue whenever it is disabled ("finish the human check first", "the check couldn't be reached", "the check expired — tick the box again").
- Reset cleanly when the box expires or errors, and re-show the widget so a second attempt is possible.
- Surface the exact failure text from the verification step (wrong key pairing, network problem) rather than a generic message, so this is diagnosable next time.
- Keep the current rule: warnings never block, only a genuine "can't run here" verdict does.

## 2. Typing a question doesn't enable Send

The Send button is wired to a copy of the message text kept in React state, which is filled by a hand-attached listener on the message box. When that plumbing doesn't fire, the button stays greyed out even though text is visible.

Change: stop mirroring the text into React state as the gate for Send. Read the box's current value at submit time, and enable Send whenever the model is idle. The box is cleared after sending as it is now. Same treatment for the model picker, which uses the same hand-attached listener pattern.

## 3. Ideas from the research doc worth doing here

Small, in-scope additions that match what the document recommends:

- **Name the execution path honestly in the UI.** The doc is emphatic that no web API guarantees NPU/Neural Engine use. The device panel already says this; add the same one-liner to the pre-flight card.
- **Add a CPU fallback note.** When graphics acceleration is missing, today the app is a dead end. The doc's recommended architecture is WebGPU primary with a CPU fallback. Worth flagging as a possible next step on the blocked screen (not built in this pass).
- **Browser-provided models.** Chrome and Edge now expose a built-in model to web pages on qualifying hardware. A cheap win: detect it during pre-flight and mention "your browser already has a model built in" — no download needed. Proposed as a follow-up, not part of this fix.

Say the word if you want any of section 3 built now; otherwise this pass is sections 1 and 2 only.

## Technical notes

- `src/components/entry-gate.tsx`: fail-closed gating, retry affordance, disabled-reason text, expiry/error reset.
- `src/lib/hcaptcha.functions.ts`: return a distinguishable "not configured" vs "verification failed" result so the UI can react correctly.
- `src/components/on-device-chat.tsx`: submit reads the textarea value directly; Send enabled on idle; select handled via the documented `change` event with a value read at handler time.
- Verification: typecheck, production build, and a headless run of the gate and chat flow.
