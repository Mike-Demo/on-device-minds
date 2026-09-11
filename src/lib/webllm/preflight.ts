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

const WIFI_ADVICE = "Switch to Wi-Fi first if you can, to avoid data charges and a slow start.";

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function isCellular(): boolean {
  const connection = nav()?.connection;
  if (!connection) return false;
  if (connection.type === "cellular") return true;
  const effective = connection.effectiveType;
  return effective === "slow-2g" || effective === "2g" || effective === "3g";
}

function networkCheck(neededMb: number, cached: boolean): PreflightCheck {
  if (isOffline()) {
    return {
      id: "network",
      label: "Network",
      level: cached ? "pass" : "fail",
      detail: cached
        ? "You appear to be offline, but this model is already saved here, so it still works."
        : "You appear to be offline. The model has to be downloaded once before it can run.",
    };
  }
  const connection = nav()?.connection;
  const saveData = connection?.saveData === true;
  if (isCellular() || saveData) {
    return {
      id: "network",
      label: "Network",
      level: cached ? "pass" : "warn",
      detail: cached
        ? "This looks like a mobile data connection, but the model is already saved here — nothing to download."
        : `This looks like a mobile data connection${
            saveData ? " with data saver on" : ""
          }. The model is a one-time download of about ${neededMb} MB. ${WIFI_ADVICE}`,
    };
  }
  if (connection?.type === "wifi" || connection?.type === "ethernet") {
    return {
      id: "network",
      label: "Network",
      level: "pass",
      detail: "Looks like Wi-Fi or a wired connection — good for a large one-time download.",
    };
  }
  return {
    id: "network",
    label: "Network",
    level: "unknown",
    detail: cached
      ? "This browser does not report the kind of connection you are on. The model is already saved here anyway."
      : `This browser does not report the kind of connection you are on. Use Wi-Fi for the ${neededMb} MB download if you can.`,
  };
}

/** Shared wording so measured and reported speeds read the same. */
export function describeDownload(neededMb: number, mbps: number): string {
  const minutes = (neededMb * 8) / (mbps * 60);
  return minutes < 1 ? "under a minute" : `roughly ${Math.ceil(minutes)} minutes`;
}

const SPEED_SAMPLE_BYTES = 3 * 1024 * 1024;

/**
 * Times a small ranged download from the same host the models come from.
 * Returns null when the test cannot be completed.
 */
export async function measureDownloadSpeed(): Promise<{ mbps: number } | null> {
  if (typeof fetch === "undefined" || isOffline()) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const started = performance.now();
    const response = await fetch(CPU_MODEL_URL, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Range: `bytes=0-${SPEED_SAMPLE_BYTES - 1}` },
    });
    if (!response.ok && response.status !== 206) return null;
    const bytes = (await response.arrayBuffer()).byteLength;
    const seconds = (performance.now() - started) / 1000;
    if (bytes < 256 * 1024 || seconds <= 0) return null;
    return { mbps: (bytes * 8) / seconds / 1_000_000 };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
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
  const rough = describeDownload(neededMb, connection.downlink);
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
