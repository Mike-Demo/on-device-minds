import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { WaBadge, WaCard, WaIcon } from "@/design-system/font-awsome-web-awesome-171158";
import type { DeviceReport } from "@/lib/webllm/device";
import type { GenerationStats } from "@/lib/webllm/engine";

export interface DevicePanelProps {
  readonly device: DeviceReport | null;
  readonly appleSilicon: boolean;
  readonly stats: GenerationStats | null;
  /** Show the link to the explainer page. Hidden on the explainer page itself. */
  readonly showExplainerLink?: boolean;
}

function formatRate(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(1)} tok/s`;
}

export function DevicePanel({ device, appleSilicon, stats }: DevicePanelProps): ReactElement {
  return (
    <WaCard appearance="outlined" with-header>
      <div slot="header" className="wa-cluster wa-gap-xs wa-align-items-center">
        <WaIcon name="microchip" />
        <strong>What this is running on</strong>
      </div>

      <div className="wa-stack wa-gap-m">
        <div className="wa-cluster wa-gap-xs">
          <WaBadge variant={device?.webgpu ? "success" : "danger"} appearance="filled" pill>
            {device?.webgpu ? "Graphics chip (WebGPU)" : "No graphics acceleration"}
          </WaBadge>
          <WaBadge variant="neutral" appearance="outlined" pill>
            Neural Engine: not reachable
          </WaBadge>
        </div>

        {device?.adapter ? <p className="odc-meta">Adapter: {device.adapter}</p> : null}

        <div className="wa-grid wa-gap-m">
          <div className="wa-stack wa-gap-3xs">
            <span className="odc-meta">Reading your question</span>
            <span className="odc-stat-value">{formatRate(stats?.promptTokensPerSecond ?? null)}</span>
          </div>
          <div className="wa-stack wa-gap-3xs">
            <span className="odc-meta">Writing the answer</span>
            <span className="odc-stat-value">{formatRate(stats?.decodeTokensPerSecond ?? null)}</span>
          </div>
          <div className="wa-stack wa-gap-3xs">
            <span className="odc-meta">Words generated</span>
            <span className="odc-stat-value">{stats?.completionTokens ?? "—"}</span>
          </div>
        </div>

        <p className="odc-meta">
          {appleSilicon
            ? "This looks like an Apple device. Its Neural Engine is only available to native apps through Core ML — no browser can reach it today, so the work runs on the GPU instead."
            : "Browsers can only reach the GPU. Dedicated neural accelerators stay off-limits to web pages until the WebNN standard ships."}
        </p>
      </div>
    </WaCard>
  );
}
