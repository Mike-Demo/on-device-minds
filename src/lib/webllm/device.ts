/**
 * Browser hardware detection for on-device inference.
 * Every function is safe to import on the server; they simply report
 * "unsupported" when there is no browser around.
 */

export interface DeviceReport {
  /** True when the browser exposes WebGPU, which is what WebLLM needs. */
  readonly webgpu: boolean;
  /** Adapter description, e.g. "apple / metal-3", when available. */
  readonly adapter: string | null;
  /** Plain-language reason when WebGPU is unavailable. */
  readonly reason: string | null;
}

interface AdapterInfoLike {
  readonly vendor?: string;
  readonly architecture?: string;
  readonly device?: string;
  readonly description?: string;
}

function describeAdapter(info: AdapterInfoLike | undefined): string | null {
  if (!info) return null;
  const parts = [info.vendor, info.architecture, info.device, info.description].filter(
    (part): part is string => typeof part === "string" && part.length > 0,
  );
  return parts.length > 0 ? parts.join(" / ") : null;
}

export async function inspectDevice(): Promise<DeviceReport> {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    return {
      webgpu: false,
      adapter: null,
      reason:
        "This browser does not expose WebGPU, so a model cannot run here. Try the latest Chrome, Edge, or Safari.",
    };
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return {
        webgpu: false,
        adapter: null,
        reason:
          "WebGPU exists in this browser but no graphics adapter was granted. Hardware acceleration may be switched off.",
      };
    }

    const info = (adapter as GPUAdapter & { info?: AdapterInfoLike }).info;
    return { webgpu: true, adapter: describeAdapter(info), reason: null };
  } catch {
    return {
      webgpu: false,
      adapter: null,
      reason: "Requesting a graphics adapter failed, so the model cannot run on this device.",
    };
  }
}

/**
 * Whether the platform has a dedicated neural accelerator that a browser
 * still cannot reach. Used to explain the Neural Engine question honestly.
 */
export function isAppleSilicon(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const touchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|Macintosh/.test(ua) || touchMac;
}

/**
 * Whether the browser can run the processor-only (WebAssembly) path.
 * This is the fallback when WebGPU is unavailable.
 */
export function isCpuRuntimeSupported(): boolean {
  return (
    typeof WebAssembly !== "undefined" &&
    typeof Worker !== "undefined" &&
    typeof navigator !== "undefined"
  );
}
