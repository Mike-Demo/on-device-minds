import { useEffect, useState } from "react";
import type { ReactElement } from "react";

import {
  WaBadge,
  WaCallout,
  WaCard,
  WaCopyButton,
  WaDivider,
  WaIcon,
  WaSpinner,
} from "@/design-system/font-awsome-web-awesome-171158";

import {
  collectDiagnostics,
  type DiagnosticsReport,
  type Reading,
  type ReadingLevel,
} from "@/lib/webllm/diagnostics";

const LEVEL_ICON: Record<ReadingLevel, string> = {
  good: "circle-check",
  caution: "triangle-exclamation",
  missing: "circle-xmark",
  info: "circle-info",
};

const LEVEL_VARIANT: Record<ReadingLevel, "success" | "warning" | "danger" | "neutral"> = {
  good: "success",
  caution: "warning",
  missing: "danger",
  info: "neutral",
};

function ReadingRow({ reading }: { readonly reading: Reading }): ReactElement {
  return (
    <>
      <WaDivider />
      <div className="wa-stack wa-gap-3xs">
        <div className="wa-cluster wa-gap-xs wa-align-items-center">
          <WaIcon name={LEVEL_ICON[reading.level]} variant={LEVEL_VARIANT[reading.level]} />
          <strong>{reading.label}</strong>
        </div>
        <span>{reading.value}</span>
        <span className="odc-meta">{reading.why}</span>
      </div>
    </>
  );
}

export function DeviceDiagnostics(): ReactElement {
  const [report, setReport] = useState<DiagnosticsReport | null>(null);

  useEffect(() => {
    let live = true;
    void collectDiagnostics().then((result) => {
      if (live) setReport(result);
    });
    return () => {
      live = false;
    };
  }, []);

  if (report === null) {
    return (
      <div className="wa-cluster wa-gap-s wa-align-items-center">
        <WaSpinner />
        <span className="odc-meta">Reading this device…</span>
      </div>
    );
  }

  return (
    <div className="wa-stack wa-gap-2xl">
      <WaCallout variant={report.webgpu ? "success" : "warning"} appearance="outlined">
        <WaIcon slot="icon" name={report.webgpu ? "circle-check" : "triangle-exclamation"} />
        <strong>
          {report.browserVersion ? `${report.browserName} ${report.browserVersion}` : report.browserName}
          {" on "}
          {report.osLabel}
        </strong>
        <p>
          {report.webgpu
            ? "This browser can reach the graphics chip, so the larger models are available to you."
            : "This browser cannot reach the graphics chip, so models here run on the processor instead. The tips below may change that."}
        </p>
      </WaCallout>

      {report.groups.map((group) => (
        <WaCard key={group.id} appearance="outlined" with-header>
          <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
            <WaIcon name={group.icon} />
            <h2 className="odc-card-heading">{group.heading}</h2>
          </div>
          <div className="wa-stack wa-gap-m">
            {group.readings.map((reading) => (
              <ReadingRow key={reading.id} reading={reading} />
            ))}
          </div>
        </WaCard>
      ))}

      <WaCard appearance="outlined" with-header>
        <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
          <WaIcon name="lightbulb" />
          <h2 className="odc-card-heading">What would help on this device</h2>
        </div>
        <div className="wa-stack wa-gap-m">
          {report.tips.map((tip) => (
            <div key={tip.id} className="wa-stack wa-gap-3xs">
              <WaDivider />
              <strong>{tip.title}</strong>
              <span className="odc-meta">{tip.body}</span>
              {tip.command ? (
                <div className="wa-cluster wa-gap-xs wa-align-items-center">
                  <code>{tip.command}</code>
                  <WaCopyButton value={tip.command} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </WaCard>

      <WaCard appearance="outlined" with-header>
        <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
          <WaIcon name="compass" />
          <h2 className="odc-card-heading">Browsers worth trying here</h2>
        </div>
        <div className="wa-stack wa-gap-m">
          {report.browsers.map((browser) => (
            <div key={browser.name} className="wa-stack wa-gap-3xs">
              <WaDivider />
              <a href={browser.url} target="_blank" rel="noreferrer noopener">
                {browser.name}
              </a>
              <span className="odc-meta">{browser.note}</span>
            </div>
          ))}
        </div>
      </WaCard>

      <div className="wa-cluster wa-gap-s wa-align-items-center">
        <WaCopyButton value={report.plainText} />
        <span className="odc-meta">Copy the whole report if you want to send it to someone.</span>
        <WaBadge variant="neutral" appearance="outlined" pill>
          Read on this device only — nothing is sent anywhere
        </WaBadge>
      </div>
    </div>
  );
}
