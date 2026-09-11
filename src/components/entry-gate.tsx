import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";

import {
  HCaptcha,
  WaBadge,
  WaButton,
  WaCallout,
  WaCard,
  WaIcon,
  WaSpinner,
} from "@/design-system/font-awsome-web-awesome-171158";
import { getCaptchaSiteKey, verifyCaptcha } from "@/lib/hcaptcha.functions";
import { runPreflight, type CheckLevel, type PreflightReport } from "@/lib/webllm/preflight";
import { findModel } from "@/lib/webllm/models";

export const GATE_STORAGE_KEY = "odc-gate-cleared";

export interface EntryGateProps {
  readonly modelId: string;
  readonly onContinue: () => void;
}

const LEVEL_ICON: Record<CheckLevel, string> = {
  pass: "circle-check",
  warn: "triangle-exclamation",
  fail: "circle-xmark",
  unknown: "circle-question",
};

const LEVEL_VARIANT: Record<CheckLevel, "success" | "warning" | "danger" | "neutral"> = {
  pass: "success",
  warn: "warning",
  fail: "danger",
  unknown: "neutral",
};

export function EntryGate({ modelId, onContinue }: EntryGateProps): ReactElement {
  const model = findModel(modelId);
  const [report, setReport] = useState<PreflightReport | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await runPreflight(modelId);
      if (active) setReport(result);
    })();
    return () => {
      active = false;
    };
  }, [modelId]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const result = await getCaptchaSiteKey();
        if (active) setSiteKey(result.siteKey);
      } catch {
        if (active) setSiteKey(null);
      } finally {
        if (active) setCaptchaLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const onVerify = useCallback((token: string) => {
    setVerifying(true);
    setCaptchaError(null);
    void (async () => {
      try {
        const result = await verifyCaptcha({ data: { token } });
        setVerified(result.ok);
        setCaptchaError(result.error);
      } catch {
        setVerified(false);
        setCaptchaError("The human check could not be completed. Please try again.");
      } finally {
        setVerifying(false);
      }
    })();
  }, []);

  const humanCheckDone = verified || (captchaLoaded && siteKey === null);
  const blocked = report?.verdict === "blocked";
  const canContinue = report !== null && !blocked && humanCheckDone;

  return (
    <div className="odc-shell wa-stack wa-gap-2xl">
      <header className="wa-stack wa-gap-s">
        <h1>Before you start</h1>
        <p className="odc-lede">
          This page runs a real language model inside your browser. Here is what that means, and
          whether your device is up to it.
        </p>
      </header>

      <WaCard appearance="outlined" with-header>
        <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
          <WaIcon name="circle-info" />
          <strong>What to expect</strong>
        </div>
        <ul className="odc-gate-list wa-stack wa-gap-s">
          <li>
            The model is downloaded once — about {model.approxDownloadMb} MB — and kept in this
            browser, so it is instant the next time.
          </li>
          <li>
            Everything runs on your own hardware. Nothing you type leaves this device, and there is
            no account, key, or server involved.
          </li>
          <li>
            Web pages can only use the graphics chip. Apple&apos;s Neural Engine stays out of reach —{" "}
            <Link to="/neural-engine">why that is</Link>.
          </li>
          <li>
            These are very small models. They are quick and private, but far less capable than a
            cloud assistant, and they do get things wrong.
          </li>
        </ul>
      </WaCard>

      <WaCard appearance="outlined" with-header>
        <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
          <WaIcon name="stethoscope" />
          <strong>Checking this device</strong>
        </div>

        {report === null ? (
          <div className="wa-cluster wa-gap-s wa-align-items-center">
            <WaSpinner />
            <span className="odc-meta">Running a quick check…</span>
          </div>
        ) : (
          <div className="wa-stack wa-gap-m">
            <ul className="odc-gate-checks wa-stack wa-gap-s">
              {report.checks.map((check) => (
                <li key={check.id} className="wa-flank wa-gap-s wa-align-items-start">
                  <WaIcon name={LEVEL_ICON[check.level]} />
                  <div className="wa-stack wa-gap-3xs">
                    <div className="wa-cluster wa-gap-xs wa-align-items-center">
                      <strong>{check.label}</strong>
                      <WaBadge variant={LEVEL_VARIANT[check.level]} appearance="outlined" pill>
                        {check.level === "pass"
                          ? "Fine"
                          : check.level === "warn"
                            ? "Heads up"
                            : check.level === "fail"
                              ? "Problem"
                              : "Unknown"}
                      </WaBadge>
                    </div>
                    <span className="odc-meta">{check.detail}</span>
                  </div>
                </li>
              ))}
            </ul>

            <WaCallout
              variant={
                report.verdict === "ready"
                  ? "success"
                  : report.verdict === "slow"
                    ? "warning"
                    : "danger"
              }
              appearance="outlined"
            >
              <WaIcon slot="icon" name={LEVEL_ICON[report.verdict === "ready" ? "pass" : report.verdict === "slow" ? "warn" : "fail"]} />
              <strong>
                {report.verdict === "ready"
                  ? "This device should handle it"
                  : report.verdict === "slow"
                    ? "It should work, but expect it to be slow"
                    : "This device can't run a model here"}
              </strong>
              <p>
                {report.verdict === "ready"
                  ? "Everything the model needs is available. You can continue."
                  : report.verdict === "slow"
                    ? "You can still continue — the download may take a while and answers may come slowly. Choosing the smallest model helps."
                    : "One of the checks above rules it out. You can still read the explanation of how this works."}
              </p>
            </WaCallout>
          </div>
        )}
      </WaCard>

      {!blocked ? (
        <WaCard appearance="outlined" with-header>
          <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
            <WaIcon name="shield-halved" />
            <strong>Quick human check</strong>
          </div>

          <div className="wa-stack wa-gap-m">
            {!captchaLoaded ? (
              <div className="wa-cluster wa-gap-s wa-align-items-center">
                <WaSpinner />
                <span className="odc-meta">Loading…</span>
              </div>
            ) : siteKey ? (
              <>
                <p className="odc-meta">
                  Model downloads are large, so this keeps automated traffic away.
                </p>
                <HCaptcha siteKey={siteKey} onVerify={onVerify} onExpire={() => setVerified(false)} />
                {verifying ? <span className="odc-meta">Checking…</span> : null}
                {captchaError ? <span className="odc-meta">{captchaError}</span> : null}
                {verified ? (
                  <WaBadge variant="success" appearance="filled" pill>
                    Verified
                  </WaBadge>
                ) : null}
              </>
            ) : (
              <p className="odc-meta">
                The human check isn&apos;t set up yet, so you can continue without it.
              </p>
            )}
          </div>
        </WaCard>
      ) : null}

      <div className="wa-cluster wa-gap-s wa-align-items-center">
        <WaButton variant="brand" size="l" disabled={!canContinue} onClick={onContinue}>
          <WaIcon slot="start" name="arrow-right" />
          Continue to the model
        </WaButton>
        <Link to="/neural-engine" className="odc-meta">
          How this works on Apple hardware
        </Link>
      </div>
    </div>
  );
}
