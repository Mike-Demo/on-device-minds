# Security audit remediation backlog — 2026-10-21

Parent audit: [Mike-Demo/on-device-minds#5](https://github.com/Mike-Demo/on-device-minds/issues/5).

This is the issue-filing fallback requested by the parent: this session has no
issue-creation tool. Each title and body below is ready to file in this repository.
No remediation code was changed. The audit used static source inspection only;
no deployed endpoint was probed. Confirmed classifications are carried forward
from the audit, not evidence of an observed compromise.

## Priority and grouping

1. **Medium: remote script execution.** Every visitor loads the script, including
   on chat and diagnostics routes. A malicious change at the lower-trust script
   host would execute with the page's privileges; exploiting this does require
   control of the script delivery, not merely visiting the site. Removing the
   tracker and its unused CSP allowances is the smallest, lowest-complexity fix.
2. **Low: inaccurate privacy disclosures.** The undisclosed third-party request
   occurs during ordinary visits without requiring a compromise. Its direct
   impact is narrower than arbitrary page-origin script execution. Removing the
   tracker can resolve both findings; if retained, disclosures must be corrected.

Keep two remediation issues: the shared integration is the tracker, but the root
causes are distinct—trusting mutable remote executable code versus omitting a
third-party data flow from exhaustive disclosures. Fixing integrity alone does
not correct the disclosures, and correcting disclosures does not constrain script
execution. Cross-reference the issues when filing; avoid duplicating tracker
removal work.

The three validation leads remain unranked and have no severity. The parent
contains literal truncations in both confirmed findings' “What” paragraphs and
the final lead's owner-check instruction. The complete root causes and fixes for
the confirmed findings are available; missing prose has not been reconstructed.

## Remediation issue 1

### Title

[security][medium] Remove or integrity-pin the third-party analytics script

### Body

Parent: https://github.com/Mike-Demo/on-device-minds/issues/5

Fingerprint: `third-party-umami-script-full-origin-privilege`

**Evidence**

- [RootShell, lines 162–168](https://github.com/Mike-Demo/on-device-minds/blob/c1e832bb7e5de054a173b00944753441f0d0695f/src/routes/__root.tsx#L162-L168)
  unconditionally emits a deferred script from
  `https://umami-lite.view.fast/tracker.js`. It has no integrity attribute or
  version pin and is included on every route, including chat and diagnostics.
- [CSP, lines 101–114](https://github.com/Mike-Demo/on-device-minds/blob/c1e832bb7e5de054a173b00944753441f0d0695f/src/routes/__root.tsx#L101-L114)
  allows that host in both `script-src` and `connect-src`.
- A changed or compromised script would run with the page's privileges and could
  read chat DOM content. This is a supply-chain exposure, not a claim that the
  current tracker has been observed collecting chat content.

**Root cause**

The shared route shell trusts mutable, unpinned, integrity-unchecked third-party
JavaScript with full site-origin access and permits connections to its host.

**Smallest fix**

Remove the tracker tag and its now-unused `script-src` and `connect-src` host
allowances. If analytics must remain, self-host a reviewed, pinned copy and remove
the remote script allowance, or use an immutable remote version with matching SRI
and appropriate cross-origin loading configuration. Page exclusions can reduce
exposure but do not eliminate mutable remote-code trust on remaining pages.

**Acceptance checks**

- [ ] No page executes mutable, integrity-unchecked JavaScript from this host.
- [ ] Verify the selected fix on chat, diagnostics, and ordinary routes; for
      removal, verify no tracker requests or leftover host allowances remain.
- [ ] Coordinate with the disclosure issue: removing the tracker can satisfy
      both, while retaining it still requires accurate disclosures.

## Remediation issue 2

### Title

[security][low] Reconcile analytics collection with privacy disclosures

### Body

Parent: https://github.com/Mike-Demo/on-device-minds/issues/5

Fingerprint: `undisclosed-analytics-beacon-contradicts-privacy-page`

**Evidence**

- [RootShell, lines 162–168](https://github.com/Mike-Demo/on-device-minds/blob/c1e832bb7e5de054a173b00944753441f0d0695f/src/routes/__root.tsx#L162-L168)
  loads the third-party tracker on every route, including `/privacy`; the
  [CSP connection allowance](https://github.com/Mike-Demo/on-device-minds/blob/c1e832bb7e5de054a173b00944753441f0d0695f/src/routes/__root.tsx#L109)
  also permits its beacon.
- [Privacy, lines 92–106](https://github.com/Mike-Demo/on-device-minds/blob/c1e832bb7e5de054a173b00944753441f0d0695f/src/routes/privacy.tsx#L92-L106)
  says “Two things” leave the device and lists only static-host traffic/logs and
  Hugging Face downloads, omitting the analytics host.
- [About, lines 115–127](https://github.com/Mike-Demo/on-device-minds/blob/c1e832bb7e5de054a173b00944753441f0d0695f/src/routes/about.tsx#L115-L127)
  claims “no data collection beyond what the static host logs to serve the files.”
- Loading the remote script sends a request to a separate host, exposing network
  request metadata. The audit lists IP address, user-agent, page URL, and referrer;
  exact URL/referrer detail depends on browser/referrer policy and tracker
  behavior. Actual beacon payloads were not observed in this static audit.

**Root cause**

Unconditional third-party analytics loading conflicts with exhaustive
privacy/about disclosures that omit that data flow.

**Smallest fix**

Remove the tracker, coordinating with the medium-priority issue. If retained,
update the privacy page's “What does leave the device” list to identify the
`umami-lite.view.fast` host, its verified operator, and the pageview/request data
it receives; reconcile the about-page claim and corresponding published
Markdown disclosures. Verify the actual data flow before describing it.

**Acceptance checks**

- [ ] Either remove the analytics flow on every route, or accurately disclose
      the verified recipient and collected data.
- [ ] Ensure privacy/about disclosures and their published Markdown equivalents
      agree with the selected behavior.
- [ ] Do not treat disclosure changes as remediation of remote script execution.

## Validation checklist issue

### Title

[security][needs-validation] Audit leads to validate

### Body

Parent: https://github.com/Mike-Demo/on-device-minds/issues/5

These are static-inspection leads, not confirmed vulnerabilities. Record evidence
and disposition for each; do not assign severity before validation. The missing
facts below are quoted verbatim from the parent, including its final truncation.

- [ ] **Meta-delivered CSP has no frame-ancestors while a code comment claims framing is blocked**

  Fingerprint: `meta-csp-no-frame-ancestors-framing-claim`

  Claimed root cause: The repository's meta-delivered CSP omits
  `frame-ancestors`; any effective framing protection must come from host response
  headers outside the repository.

  **Exact missing fact:**

  > Whether the SpaceFast production host adds an HTTP-response X-Frame-Options header or a header-delivered Content-Security-Policy containing frame-ancestors for ai.mikedemo.dev. Owner check: read the production response headers in the host dashboard or browser devtools (no audit probing of the deployment).

- [ ] **Shipped saveThemeDefaults server function writes unauthenticated caller-supplied CSS to a server file**

  Fingerprint: `unauthenticated-theme-save-serverfn-file-write`

  Claimed root cause: An unauthenticated POST server function writes caller CSS
  verbatim, gated by `NODE_ENV`; exploitability depends on endpoint registration,
  a non-production runtime, and a writable target path.

  **Exact missing fact:**

  > Whether a built/deployed non-static server bundle actually registers the saveThemeDefaults endpoint (inspect the built server bundle / server-function manifest) AND runs it with NODE_ENV != 'production' with a writable/existing src/webawesome/ path. Owner bundle/manifest inspection resolves this; no live probing.

- [ ] **CPU models fetched from unofficial third-party Hugging Face repos are persistently cached with no integrity pinning in app code**

  Fingerprint: `unpinned-third-party-gguf-models-persistent-cache`

  Claimed root cause: App code provides no reviewed artifact hash, size, or
  signature; downloaded models persist in a cache trusted by a size-only check,
  leaving integrity dependent on library behavior.

  **Exact available missing fact:**

  > Whether @wllama/wllama 3.8.1's loadModelFromHF (and the HF resolve path it uses) verifies the GGUF file's LFS SHA-256/hash internally before first parse and before trusting the persistent cache. Owner check: read the installed library's download/cache code for hash verification, or record the HF LFS oid for the two pinned files and compare it agai…

  The parent ends this instruction literally at `agai…`. Obtain the untruncated
  comparison instruction from the audit owner; do not infer its missing ending.
  The library hash-verification question above remains the validation gate.
