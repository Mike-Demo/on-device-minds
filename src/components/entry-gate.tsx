import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";

import {
  WaBadge,
  WaButton,
  WaCallout,
  WaCard,
  WaIcon,
  WaSpinner,
} from "@/design-system/font-awsome-web-awesome-171158";
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

type SpeedPhase = "idle" | "running" | "done" | "failed";

export function EntryGate({ modelId, onContinue }: EntryGateProps): ReactElement {
  const model = findModel(modelId);
  const [report, setReport] = useState<PreflightReport | null>(null);
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

  const blocked = report?.verdict === "blocked";
  const offline =
    report?.checks.some((check) => check.id === "network" && check.level === "fail") ?? false;
  const canContinue = report !== null && !blocked;

  const blockedReason = (): string | null =>
    report === null ? "Finishing the device check…" : null;

  // React does not reliably clear a boolean attribute it set on a custom
  // element, so drive the button's own `disabled` property instead.
  const continueRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const element = continueRef.current as (HTMLElement & { disabled?: boolean }) | null;
    if (element) element.disabled = !canContinue;
  }, [canContinue]);



  return (
    <div className="odc-shell wa-stack wa-gap-2xl">
      <header className="wa-stack wa-gap-s">
        <h2>On-device AI pre-flight check</h2>
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

      <div className="wa-cluster wa-gap-s wa-align-items-center">
        <WaButton
          ref={continueRef}
          variant="brand"
          size="l"
          disabled={!canContinue}
          onClick={onContinue}
        >
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

      <WaCard appearance="outlined" with-header>
        <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
          <WaIcon name="magnifying-glass-chart" />
          <h2 className="odc-card-heading">Full device report</h2>
        </div>
        <div className="wa-stack wa-gap-m">
          <p className="odc-meta">
            Want the detail behind these checks? The diagnostics page names your browser, operating
            system and graphics chip, lists the features that decide the speed, and gives tips for
            your exact device — including the hidden settings in Safari on iPhone and iPad, and the
            hardware acceleration switch in Chrome and Edge.
          </p>
          <Link to="/diagnostics" className="odc-meta">
            Open the device diagnostics
          </Link>
        </div>
      </WaCard>
    </div>
  );
}
