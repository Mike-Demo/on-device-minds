import { useEffect, useState } from "react";
import type { ReactElement } from "react";

import { inspectDevice, isAppleSilicon, type DeviceReport } from "@/lib/webllm/device";

import { DevicePanel } from "./device-panel";

/**
 * Live hardware readout for the explainer page. Client-side only:
 * it asks the browser what graphics hardware it can reach.
 */
export function NeuralEngineReadout(): ReactElement {
  const [device, setDevice] = useState<DeviceReport | null>(null);
  const [appleSilicon, setAppleSilicon] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const report = await inspectDevice();
      if (!active) return;
      setDevice(report);
      setAppleSilicon(isAppleSilicon());
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DevicePanel device={device} appleSilicon={appleSilicon} stats={null} showExplainerLink={false} />
  );
}
