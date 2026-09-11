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
import {
  describeDownload,
  measureDownloadSpeed,
  runPreflight,
  type CheckLevel,
  type PreflightReport,
} from "@/lib/webllm/preflight";
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

type CaptchaPhase = "loading" | "ready" | "unavailable";

type SpeedPhase = "idle" | "running" | "done" | "failed";

export function EntryGate({ modelId, onContinue }: EntryGateProps): ReactElement {
  const model = findModel(modelId);
  const [report, setReport] = useState<PreflightReport | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [phase, setPhase] = useState<CaptchaPhase>("loading");
  const [attempt, setAttempt] = useState(0);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [speedPhase, setSpeedPhase] = useState<SpeedPhase>("idle");
  const [speedMbps, setSpeedMbps] = useState<number | null>(null);

  const runSpeedTest = useCallback(() => {
    setSpeedPhase("running");
    void (async () => {
      const result = await measureDownloadSpeed();
      if (result === null) {
        setSpeedMbps(null);
        setSpeedPhase("failed");
        return;
      }
      setSpeedMbps(result.mbps);
      setSpeedPhase("done");
    })();
  }, []);

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
    setPhase("loading");
    void (async () => {
      try {
        const result = await getCaptchaSiteKey();
        if (!active) return;
        if (result.siteKey) {
          setSiteKey(result.siteKey);
          setPhase("ready");
        } else {
          setSiteKey(null);
          setPhase("unavailable");
          setCaptchaError("The human check isn't available right now.");
        }
      } catch {
        if (!active) return;
        setSiteKey(null);
        setPhase("unavailable");
        setCaptchaError("The human check could not be loaded.");
      }
    })();
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setVerified(false);
    setVerifying(false);
    setCaptchaError(null);
    setAttempt((value) => value + 1);
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

  const blocked = report?.verdict === "blocked";
  const offline =
    report?.checks.some((check) => check.id === "network" && check.level === "fail") ?? false;
  const canContinue = report !== null && !blocked && verified;

  const blockedReason = (): string | null => {
    if (report === null) return "Finishing the device check…";
    if (blocked) return null;
    if (verified) return null;
    if (verifying) return "Checking your answer…";
    if (phase === "loading") return "Loading the human check…";
    if (phase === "unavailable") return "The human check couldn't load — try again.";
    return "Tick the human check box first.";
  };


  return (
    <div className="odc-shell wa-stack wa-gap-2xl">
      <header className="wa-stack wa-gap-s">
        <h1>On-device AI pre-flight check</h1>
        <p className="odc-lede">
          This page runs a real language model inside your browser. Here is what that means, and
          whether your device is up to it.
        </p>
      </header>

      <WaCard appearance="outlined" with-header>
        <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
          <WaIcon name="circle-info" />
          <h2 className="odc-card-heading">What to expect</h2>
        </div>
        <ul className="odc-gate-list wa-stack wa-gap-s">
          <li>
            The model is downloaded once — about {report?.downloadMb ?? model.approxDownloadMb} MB —
            and kept in this browser, so it is instant the next time.
          </li>
          <li>
            Everything runs on your own hardware. Nothing you type leaves this device, and there is
            no account, key, or server involved.
          </li>
          {report?.runtime === "cpu" ? (
            <li>
              This browser can&apos;t use the graphics chip, so the model will run on the processor
              instead. It still works — answers just come out much more slowly.
            </li>
          ) : null}
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
          <h2 className="odc-card-heading">Checking this device</h2>
        </div>

        {report === null ? (
          <div className="wa-cluster wa-gap-s wa-align-items-center">
            <WaSpinner />
            <span className="odc-meta">Running a quick check…</span>
          </div>
        ) : (
          <div className="wa-stack wa-gap-m">
            <ul className="odc-gate-checks wa-stack wa-gap-s">
              {report.checks.map((check) => {
                const isDownload = check.id === "connection";
                const measured = isDownload && speedPhase === "done" && speedMbps !== null;
                const level: CheckLevel = measured
                  ? speedMbps < 5
                    ? "warn"
                    : "pass"
                  : check.level;
                const detail = measured
                  ? `Measured about ${Math.round(speedMbps)} Mbps — ${describeDownload(
                      report.downloadMb,
                      speedMbps,
                    )} for the ${report.downloadMb} MB download.${
                      speedMbps < 5
                        ? " That is slow — switch to Wi-Fi first if you can."
                        : ""
                    }`
                  : check.detail;
                const canTest =
                  isDownload && !report.cached && speedPhase !== "running" && !offline;

                return (
                  <li key={check.id} className="wa-flank wa-gap-s wa-align-items-start">
                    <WaIcon name={LEVEL_ICON[level]} />
                    <div className="wa-stack wa-gap-3xs">
                      <div className="wa-cluster wa-gap-xs wa-align-items-center">
                        <strong>{check.label}</strong>
                        <WaBadge variant={LEVEL_VARIANT[level]} appearance="outlined" pill>
                          {level === "pass"
                            ? "Fine"
                            : level === "warn"
                              ? "Heads up"
                              : level === "fail"
                                ? "Problem"
                                : "Unknown"}
                        </WaBadge>
                      </div>
                      <span className="odc-meta">{detail}</span>
                      {isDownload && speedPhase === "failed" ? (
                        <span className="odc-meta">
                          The speed test couldn&apos;t complete, so the estimate above is the
                          browser&apos;s own reading.
                        </span>
                      ) : null}
                      {isDownload && speedPhase === "running" ? (
                        <span className="wa-cluster wa-gap-xs wa-align-items-center">
                          <WaSpinner />
                          <span className="odc-meta">Measuring your speed…</span>
                        </span>
                      ) : null}
                      {canTest ? (
                        <span>
                          <WaButton appearance="plain" size="small" onClick={runSpeedTest}>
                            <WaIcon slot="start" name="gauge-high" />
                            {speedPhase === "idle" ? "Test my speed" : "Test again"}
                          </WaButton>
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
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
                    ? report.runtime === "cpu"
                      ? "You can still continue. Without graphics acceleration the model runs on the processor, so expect answers to arrive slowly."
                      : "You can still continue — the download may take a while and answers may come slowly. Choosing the smallest model helps."
                    : "One of the checks above rules it out — this browser can use neither the graphics chip nor the processor fallback. You can still read the explanation of how this works."}
              </p>
            </WaCallout>
          </div>
        )}
      </WaCard>

      {!blocked ? (
        <WaCard appearance="outlined" with-header>
          <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
            <WaIcon name="shield-halved" />
            <h2 className="odc-card-heading">Quick human check</h2>
          </div>

          <div className="wa-stack wa-gap-m">
            {phase === "loading" ? (
              <div className="wa-cluster wa-gap-s wa-align-items-center">
                <WaSpinner />
                <span className="odc-meta">Loading…</span>
              </div>
            ) : phase === "ready" && siteKey ? (
              <>
                <p className="odc-meta">
                  Model downloads are large, so this keeps automated traffic away.
                </p>
                <HCaptcha
                  key={attempt}
                  siteKey={siteKey}
                  onVerify={onVerify}
                  onExpire={() => {
                    setVerified(false);
                    setCaptchaError("The check expired — tick the box again.");
                  }}
                  onError={() => {
                    setVerified(false);
                    setCaptchaError("The check ran into a problem. Please try again.");
                  }}
                />
                {verifying ? <span className="odc-meta">Checking…</span> : null}
                {captchaError ? <span className="odc-meta">{captchaError}</span> : null}
                {verified ? (
                  <WaBadge variant="success" appearance="filled" pill>
                    Verified
                  </WaBadge>
                ) : null}
                {!verified && !verifying && captchaError ? (
                  <WaButton appearance="outlined" onClick={retry}>
                    <WaIcon slot="start" name="rotate-right" />
                    Try again
                  </WaButton>
                ) : null}
              </>
            ) : (
              <>
                <p className="odc-meta">
                  {captchaError ?? "The human check couldn't load."} You&apos;ll need it before
                  continuing.
                </p>
                <WaButton appearance="outlined" onClick={retry}>
                  <WaIcon slot="start" name="rotate-right" />
                  Try again
                </WaButton>
              </>
            )}
          </div>
        </WaCard>
      ) : null}

      <div className="wa-cluster wa-gap-s wa-align-items-center">
        <WaButton variant="brand" size="l" disabled={!canContinue} onClick={onContinue}>
          <WaIcon slot="start" name="arrow-right" />
          Continue to the model
        </WaButton>
        {!canContinue && !blocked ? (
          <span className="odc-meta">{blockedReason()}</span>
        ) : null}

        <Link to="/neural-engine" className="odc-meta">
          How this works on Apple hardware
        </Link>
      </div>
    </div>
  );
}
