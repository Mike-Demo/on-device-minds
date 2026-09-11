/**
 * Pre-flight checks run before offering to download a model.
 * Browser-safe: every reading is feature-detected and the module is
 * importable on the server (where it simply reports "unknown").
 */

import { inspectDevice, isCpuRuntimeSupported, type DeviceReport } from "./device";
import { CPU_MODEL, CPU_MODEL_URL, findModel, type RuntimeKind } from "./models";

export type CheckLevel = "pass" | "warn" | "fail" | "unknown";

export interface PreflightCheck {
  readonly id: string;
  readonly label: string;
  readonly level: CheckLevel;
  readonly detail: string;
}

export type PreflightVerdict = "ready" | "slow" | "blocked";

export interface PreflightReport {
  readonly device: DeviceReport;
  readonly appleSilicon: boolean;
  readonly cached: boolean;
  readonly checks: readonly PreflightCheck[];
  readonly verdict: PreflightVerdict;
  /** Which execution path will actually be used. */
  readonly runtime: RuntimeKind;
  /** Download size for the model that path will use. */
  readonly downloadMb: number;
}

interface NavigatorExtras {
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly connection?: {
    readonly effectiveType?: string;
    readonly downlink?: number;
    readonly saveData?: boolean;
    readonly type?: string;
    readonly rtt?: number;
  };
}

function nav(): (Navigator & NavigatorExtras) | null {
  return typeof navigator === "undefined" ? null : (navigator as Navigator & NavigatorExtras);
}

function isSmallScreenDevice(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  return coarse && Math.min(window.screen.width, window.screen.height) < 700;
}

function graphicsCheck(device: DeviceReport, runtime: RuntimeKind): PreflightCheck {
  if (!device.webgpu) {
    return {
      id: "graphics",
      label: "Graphics acceleration",
      level: runtime === "cpu" ? "warn" : "fail",
      detail:
        runtime === "cpu"
          ? "Not available here, so the model will run on the processor instead. It works, but answers come out much more slowly."
          : (device.reason ?? "This browser cannot use the graphics chip, so no model can run here."),
    };
  }
  return {
    id: "graphics",
    label: "Graphics acceleration",
    level: "pass",
    detail: device.adapter ? `Available — ${device.adapter}` : "Available in this browser.",
  };
}

function memoryCheck(): PreflightCheck {
  const memory = nav()?.deviceMemory;
  if (typeof memory !== "number") {
    return {
      id: "memory",
      label: "Memory",
      level: "unknown",
      detail: "This browser does not report how much memory the device has.",
    };
  }
  if (memory <= 4) {
    return {
      id: "memory",
      label: "Memory",
      level: "warn",
      detail: `About ${memory} GB reported. Larger models may run out of memory or reload the page.`,
    };
  }
  return {
    id: "memory",
    label: "Memory",
    level: "pass",
    detail: `About ${memory} GB reported — enough for the models offered here.`,
  };
}

function processorCheck(): PreflightCheck {
  const cores = nav()?.hardwareConcurrency;
  const phone = isSmallScreenDevice();
  if (phone) {
    return {
      id: "device",
      label: "Device type",
      level: "warn",
      detail: "This looks like a phone. It will work, but expect slow answers and a heavy download.",
    };
  }
  if (typeof cores === "number" && cores <= 4) {
    return {
      id: "device",
      label: "Device type",
      level: "warn",
      detail: `${cores} processor cores reported. Answers will be slower than on a desktop machine.`,
    };
  }
  return {
    id: "device",
    label: "Device type",
    level: "pass",
    detail:
      typeof cores === "number"
        ? `Desktop or tablet class, ${cores} processor cores.`
        : "Desktop or tablet class.",
  };
}

async function storageCheck(neededMb: number): Promise<PreflightCheck> {
  const storage = typeof navigator === "undefined" ? undefined : navigator.storage;
  if (!storage?.estimate) {
    return {
      id: "storage",
      label: "Free space",
      level: "unknown",
      detail: "This browser does not report how much space is available for saved data.",
    };
  }
  try {
    const { quota = 0, usage = 0 } = await storage.estimate();
    const freeMb = Math.max(0, Math.round((quota - usage) / (1024 * 1024)));
    if (freeMb === 0) {
      return {
        id: "storage",
        label: "Free space",
        level: "unknown",
        detail: "The browser did not report a usable storage figure.",
      };
    }
    if (freeMb < neededMb) {
      return {
        id: "storage",
        label: "Free space",
        level: "fail",
        detail: `About ${freeMb} MB free, but this model needs roughly ${neededMb} MB.`,
      };
    }
    if (freeMb < neededMb * 2) {
      return {
        id: "storage",
        label: "Free space",
        level: "warn",
        detail: `About ${freeMb} MB free for a ${neededMb} MB model — tight, but it should fit.`,
      };
    }
    return {
      id: "storage",
      label: "Free space",
      level: "pass",
      detail: `About ${freeMb} MB free; this model needs roughly ${neededMb} MB.`,
    };
  } catch {
    return {
      id: "storage",
      label: "Free space",
      level: "unknown",
      detail: "Checking available space failed in this browser.",
    };
  }
}

function connectionCheck(neededMb: number, cached: boolean): PreflightCheck {
  if (cached) {
    return {
      id: "connection",
      label: "Download",
      level: "pass",
      detail: "This model is already saved in this browser — nothing to download.",
    };
  }
  const connection = nav()?.connection;
  if (!connection || typeof connection.downlink !== "number") {
    return {
      id: "connection",
      label: "Download",
      level: "unknown",
      detail: `About ${neededMb} MB to download once. This browser does not report your connection speed.`,
    };
  }
  const minutes = (neededMb * 8) / (connection.downlink * 60);
  const rough = minutes < 1 ? "under a minute" : `roughly ${Math.ceil(minutes)} minutes`;
  const slow = connection.saveData === true || connection.downlink < 5;
  return {
    id: "connection",
    label: "Download",
    level: slow ? "warn" : "pass",
    detail: `About ${neededMb} MB, ${rough} at your current speed${
      connection.saveData === true ? " (data saver is on)" : ""
    }.`,
  };
}

export async function runPreflight(modelId: string): Promise<PreflightReport> {
  const model = findModel(modelId);
  const device = await inspectDevice();

  const runtime: RuntimeKind = device.webgpu ? "gpu" : isCpuRuntimeSupported() ? "cpu" : "none";
  const downloadMb = runtime === "cpu" ? CPU_MODEL.approxDownloadMb : model.approxDownloadMb;

  let cached = false;
  try {
    if (runtime === "gpu") {
      const { isModelCached } = await import("./engine");
      cached = await isModelCached(modelId);
    } else if (runtime === "cpu") {
      const { isCpuModelCached } = await import("./cpu-engine");
      cached = await isCpuModelCached();
    }
  } catch {
    cached = false;
  }

  const { isAppleSilicon } = await import("./device");

  const checks: readonly PreflightCheck[] = [
    graphicsCheck(device, runtime),
    processorCheck(),
    memoryCheck(),
    await storageCheck(downloadMb),
    connectionCheck(downloadMb, cached),
  ];

  const verdict: PreflightVerdict = checks.some((check) => check.level === "fail")
    ? "blocked"
    : checks.some((check) => check.level === "warn")
      ? "slow"
      : "ready";

  return { device, appleSilicon: isAppleSilicon(), cached, checks, verdict, runtime, downloadMb };
}
