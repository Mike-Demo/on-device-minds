/**
 * Live device, browser and capability readings used by the diagnostics page.
 *
 * Everything here is feature-detected and safe to import on the server, where
 * it simply reports "not reported". Nothing is sent anywhere: the report is
 * assembled in the browser and rendered in place.
 */

import { inspectDevice, isAppleSilicon, isCpuRuntimeSupported } from "./device";
import { isCellular, isOffline } from "./preflight";

export type ReadingLevel = "good" | "caution" | "missing" | "info";

export interface Reading {
  readonly id: string;
  readonly label: string;
  /** What the browser reported, or "Not reported". */
  readonly value: string;
  readonly level: ReadingLevel;
  /** One sentence on why this matters for running a model here. */
  readonly why: string;
}

export interface ReadingGroup {
  readonly id: string;
  readonly heading: string;
  readonly icon: string;
  readonly readings: readonly Reading[];
}

export type Platform = "ios" | "macos" | "windows" | "android" | "linux" | "unknown";
export type Engine = "webkit" | "blink" | "gecko" | "unknown";

export interface Tip {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  /** Optional literal path the user types into their browser, e.g. edge://gpu. */
  readonly command?: string;
}

export interface BrowserSuggestion {
  readonly name: string;
  readonly url: string;
  readonly note: string;
}

export interface DiagnosticsReport {
  readonly platform: Platform;
  readonly engine: Engine;
  readonly browserName: string;
  readonly browserVersion: string | null;
  readonly osLabel: string;
  readonly webgpu: boolean;
  readonly groups: readonly ReadingGroup[];
  readonly tips: readonly Tip[];
  readonly browsers: readonly BrowserSuggestion[];
  /** Plain-text version of the whole report, for the copy button. */
  readonly plainText: string;
}

const NOT_REPORTED = "Not reported";

interface NavigatorExtras {
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly connection?: {
    readonly effectiveType?: string;
    readonly downlink?: number;
    readonly saveData?: boolean;
    readonly type?: string;
  };
}

function nav(): (Navigator & NavigatorExtras) | null {
  return typeof navigator === "undefined" ? null : (navigator as Navigator & NavigatorExtras);
}

function match(ua: string, pattern: RegExp): string | null {
  const found = ua.match(pattern);
  return found?.[1] ?? null;
}

export function detectPlatform(ua: string, maxTouchPoints: number): Platform {
  if (/iPhone|iPod/.test(ua)) return "ios";
  if (/iPad/.test(ua)) return "ios";
  // iPadOS reports a desktop user agent, but keeps a touch screen.
  if (/Macintosh/.test(ua) && maxTouchPoints > 1) return "ios";
  if (/Macintosh|Mac OS X/.test(ua)) return "macos";
  if (/Android/.test(ua)) return "android";
  if (/Windows/.test(ua)) return "windows";
  if (/Linux|X11|CrOS/.test(ua)) return "linux";
  return "unknown";
}

export function detectBrowser(ua: string): {
  name: string;
  version: string | null;
  engine: Engine;
} {
  if (/Edg\//.test(ua)) return { name: "Microsoft Edge", version: match(ua, /Edg\/([\d.]+)/), engine: "blink" };
  if (/OPR\//.test(ua)) return { name: "Opera", version: match(ua, /OPR\/([\d.]+)/), engine: "blink" };
  if (/SamsungBrowser\//.test(ua))
    return {
      name: "Samsung Internet",
      version: match(ua, /SamsungBrowser\/([\d.]+)/),
      engine: "blink",
    };
  if (/CriOS\//.test(ua))
    return { name: "Chrome on iOS", version: match(ua, /CriOS\/([\d.]+)/), engine: "webkit" };
  if (/FxiOS\//.test(ua))
    return { name: "Firefox on iOS", version: match(ua, /FxiOS\/([\d.]+)/), engine: "webkit" };
  if (/EdgiOS\//.test(ua))
    return { name: "Edge on iOS", version: match(ua, /EdgiOS\/([\d.]+)/), engine: "webkit" };
  if (/Firefox\//.test(ua))
    return { name: "Mozilla Firefox", version: match(ua, /Firefox\/([\d.]+)/), engine: "gecko" };
  if (/Chrome\//.test(ua))
    return { name: "Google Chrome", version: match(ua, /Chrome\/([\d.]+)/), engine: "blink" };
  if (/Safari\//.test(ua))
    return { name: "Safari", version: match(ua, /Version\/([\d.]+)/), engine: "webkit" };
  return { name: "Unknown browser", version: null, engine: "unknown" };
}

function osLabelFor(platform: Platform, ua: string): string {
  switch (platform) {
    case "ios": {
      const version = match(ua, /OS (\d+[_\d]*) like Mac OS X/);
      return version ? `iOS or iPadOS ${version.replace(/_/g, ".")}` : "iOS or iPadOS";
    }
    case "macos": {
      const version = match(ua, /Mac OS X (\d+[_\d]*)/);
      return version ? `macOS ${version.replace(/_/g, ".")}` : "macOS";
    }
    case "windows": {
      const version = match(ua, /Windows NT ([\d.]+)/);
      if (version === "10.0") return "Windows 10 or 11";
      return version ? `Windows (NT ${version})` : "Windows";
    }
    case "android": {
      const version = match(ua, /Android ([\d.]+)/);
      return version ? `Android ${version}` : "Android";
    }
    case "linux":
      return /CrOS/.test(ua) ? "ChromeOS" : "Linux";
    default:
      return NOT_REPORTED;
  }
}

/** WebGL renderer string, which exposes whether hardware acceleration is on. */
function webglRenderer(): { renderer: string | null; software: boolean } {
  if (typeof document === "undefined") return { renderer: null, software: false };
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return { renderer: null, software: false };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const raw = ext
      ? (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string)
      : (gl.getParameter(gl.RENDERER) as string);
    const renderer = typeof raw === "string" && raw.length > 0 ? raw : null;
    const software = renderer !== null && /swiftshader|llvmpipe|software|basic render/i.test(renderer);
    return { renderer, software };
  } catch {
    return { renderer: null, software: false };
  }
}

function wasmFeatures(): { simd: boolean; threads: boolean } {
  const has = typeof WebAssembly !== "undefined";
  let simd = false;
  if (has) {
    try {
      // Smallest module containing an v128 SIMD instruction.
      simd = WebAssembly.validate(
        new Uint8Array([
          0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0,
          253, 15, 253, 98, 11,
        ]),
      );
    } catch {
      simd = false;
    }
  }
  const threads = has && typeof SharedArrayBuffer !== "undefined";
  return { simd, threads };
}

async function storageReading(): Promise<Reading> {
  const storage = typeof navigator === "undefined" ? undefined : navigator.storage;
  if (!storage?.estimate) {
    return {
      id: "storage",
      label: "Space for saved models",
      value: NOT_REPORTED,
      level: "info",
      why: "This browser does not say how much room it will give a downloaded model.",
    };
  }
  try {
    const { quota = 0, usage = 0 } = await storage.estimate();
    const freeMb = Math.max(0, Math.round((quota - usage) / (1024 * 1024)));
    const usedMb = Math.round(usage / (1024 * 1024));
    return {
      id: "storage",
      label: "Space for saved models",
      value: `About ${freeMb} MB free, ${usedMb} MB already used by this site`,
      level: freeMb < 500 ? "caution" : "good",
      why: "A model is kept in the browser after the first download, so it needs room.",
    };
  } catch {
    return {
      id: "storage",
      label: "Space for saved models",
      value: NOT_REPORTED,
      level: "info",
      why: "Checking available space failed in this browser.",
    };
  }
}

function buildTips(report: {
  platform: Platform;
  engine: Engine;
  browserName: string;
  webgpu: boolean;
  softwareRenderer: boolean;
  memory: number | null;
  cores: number | null;
  threads: boolean;
  cellular: boolean;
  offline: boolean;
}): readonly Tip[] {
  const tips: Tip[] = [];

  if (!report.webgpu && report.platform === "ios") {
    tips.push({
      id: "ios-flags",
      title: "Turn on the graphics features in Safari",
      body: "Open Settings, then Apps → Safari → Advanced → Feature Flags, and switch on WebGPU. On older versions the same switch sits under Settings → Safari → Advanced → Experimental Features. Then fully close and reopen Safari.",
    });
    tips.push({
      id: "ios-update",
      title: "Update iOS or iPadOS",
      body: "The graphics path needs Safari 18 or later. If the feature flag is not there at all, a system update is the fastest fix.",
    });
  }

  if (!report.webgpu && report.engine === "blink") {
    tips.push({
      id: "blink-accel",
      title: "Switch hardware acceleration back on",
      body: `In ${report.browserName}, open Settings → System and enable "Use graphics acceleration when available", then restart the browser.`,
    });
    tips.push({
      id: "blink-gpu-report",
      title: "Check the built-in graphics report",
      body: "Paste this into the address bar to see exactly which features your browser has blocked and why.",
      command: report.browserName.includes("Edge") ? "edge://gpu" : "chrome://gpu",
    });
  }

  if (!report.webgpu && report.engine === "gecko") {
    tips.push({
      id: "gecko-webgpu",
      title: "Firefox is still rolling out the graphics path",
      body: "On the desktop you can enable dom.webgpu.enabled in about:config, but support is uneven. The processor-only mode here works without any of that.",
      command: "about:config",
    });
  }

  if (report.softwareRenderer) {
    tips.push({
      id: "software-renderer",
      title: "Your browser is drawing with the processor",
      body: "The graphics driver reported a software renderer, which usually means acceleration is disabled, a remote session is in the way, or the driver needs updating. Fixing that is the single biggest speed win available to you.",
    });
  }

  if (report.webgpu) {
    tips.push({
      id: "gpu-good",
      title: "Use the graphics path you already have",
      body: "Your browser can reach the graphics chip, so pick one of the larger models — they are far better and barely slower than the tiny ones on this hardware.",
    });
  }

  if (report.memory !== null && report.memory <= 4) {
    tips.push({
      id: "low-memory",
      title: "Stick to the smallest model",
      body: `About ${report.memory} GB of memory was reported. Close other tabs and apps before downloading, and choose the smallest model in the picker to avoid the page reloading mid-answer.`,
    });
  }

  if (report.cores !== null && report.cores <= 4) {
    tips.push({
      id: "few-cores",
      title: "Expect slower answers",
      body: `${report.cores} processor cores were reported. In processor-only mode the speed follows the core count almost directly, so keep questions short.`,
    });
  }

  if (!report.threads) {
    tips.push({
      id: "no-threads",
      title: "Multi-core processor mode is unavailable",
      body: "Shared memory between threads is switched off here, so processor-only mode runs on a single core. It still works, just more slowly.",
    });
  }

  if (report.cellular) {
    tips.push({
      id: "cellular",
      title: "Wait for Wi-Fi before the first download",
      body: "You appear to be on mobile data or with data saver on. The model download is hundreds of megabytes and is the same size either way.",
    });
  }

  if (report.offline) {
    tips.push({
      id: "offline",
      title: "You appear to be offline",
      body: "Already-downloaded models keep working offline. A new one needs a connection for its one-time download.",
    });
  }

  tips.push({
    id: "install",
    title: "Install the page as an app",
    body: "Installing it keeps the downloaded model around and starts faster, because the page itself is stored on the device.",
  });

  return tips;
}

const CHROME: BrowserSuggestion = {
  name: "Google Chrome",
  url: "https://www.google.com/chrome/",
  note: "Broadest support for the graphics path.",
};
const EDGE: BrowserSuggestion = {
  name: "Microsoft Edge",
  url: "https://www.microsoft.com/edge",
  note: "Same engine as Chrome, usually already installed on Windows.",
};
const SAFARI: BrowserSuggestion = {
  name: "Safari",
  url: "https://www.apple.com/safari/",
  note: "The graphics path works on recent macOS, iPadOS and iOS.",
};
const FIREFOX: BrowserSuggestion = {
  name: "Mozilla Firefox",
  url: "https://www.mozilla.org/firefox/new/",
  note: "Works, but expect processor-only mode for now.",
};

function browsersFor(platform: Platform): readonly BrowserSuggestion[] {
  switch (platform) {
    case "ios":
      return [
        {
          ...SAFARI,
          note: "Every browser on iPhone and iPad uses Safari's engine underneath, so switching browsers changes nothing — the feature flags above are what matter.",
        },
      ];
    case "macos":
      return [SAFARI, CHROME, EDGE, FIREFOX];
    case "windows":
      return [EDGE, CHROME, FIREFOX];
    case "android":
      return [
        CHROME,
        {
          name: "Samsung Internet",
          url: "https://www.samsung.com/us/apps/samsung-internet/",
          note: "Also Chrome's engine; support depends on the phone's graphics driver.",
        },
      ];
    case "linux":
      return [CHROME, EDGE, FIREFOX];
    default:
      return [CHROME, EDGE, SAFARI, FIREFOX];
  }
}

function toPlainText(groups: readonly ReadingGroup[]): string {
  return groups
    .map(
      (group) =>
        `${group.heading}\n${group.readings.map((r) => `- ${r.label}: ${r.value}`).join("\n")}`,
    )
    .join("\n\n");
}

export async function collectDiagnostics(): Promise<DiagnosticsReport> {
  const navigatorRef = nav();
  const ua = navigatorRef?.userAgent ?? "";
  const touchPoints = navigatorRef?.maxTouchPoints ?? 0;
  const platform = detectPlatform(ua, touchPoints);
  const browser = detectBrowser(ua);
  const osLabel = osLabelFor(platform, ua);

  const device = await inspectDevice();
  const gl = webglRenderer();
  const wasm = wasmFeatures();
  const memory = typeof navigatorRef?.deviceMemory === "number" ? navigatorRef.deviceMemory : null;
  const cores =
    typeof navigatorRef?.hardwareConcurrency === "number"
      ? navigatorRef.hardwareConcurrency
      : null;
  const connection = navigatorRef?.connection;
  const cellular = isCellular();
  const offline = isOffline();

  const screenLabel =
    typeof window === "undefined"
      ? NOT_REPORTED
      : `${window.screen.width} × ${window.screen.height} at ${window.devicePixelRatio}× density`;

  const deviceGroup: ReadingGroup = {
    id: "device",
    heading: "Device and browser",
    icon: "laptop",
    readings: [
      {
        id: "browser",
        label: "Browser",
        value: browser.version ? `${browser.name} ${browser.version}` : browser.name,
        level: "info",
        why: "Support for running a model in the page differs sharply between browsers.",
      },
      {
        id: "os",
        label: "Operating system",
        value: osLabel,
        level: "info",
        why: "On iPhone and iPad the system version decides which features Safari can offer.",
      },
      {
        id: "apple",
        label: "Apple hardware",
        value: isAppleSilicon() ? "Yes" : "Not detected",
        level: "info",
        why: "Apple devices are fast, but web pages still cannot reach the Neural Engine.",
      },
      {
        id: "screen",
        label: "Screen",
        value: screenLabel,
        level: "info",
        why: "Small touch screens usually mean a phone, where downloads and answers are slower.",
      },
      {
        id: "memory",
        label: "Memory reported",
        value: memory === null ? NOT_REPORTED : `About ${memory} GB`,
        level: memory === null ? "info" : memory <= 4 ? "caution" : "good",
        why: "The model is held in memory while it answers, so a bigger model needs more room.",
      },
      {
        id: "cores",
        label: "Processor cores",
        value: cores === null ? NOT_REPORTED : `${cores}`,
        level: cores === null ? "info" : cores <= 4 ? "caution" : "good",
        why: "Cores decide the speed when there is no graphics acceleration.",
      },
      {
        id: "language",
        label: "Language",
        value: navigatorRef?.language ?? NOT_REPORTED,
        level: "info",
        why: "These small models are strongest in English.",
      },
    ],
  };

  const graphicsGroup: ReadingGroup = {
    id: "graphics",
    heading: "Graphics",
    icon: "microchip",
    readings: [
      {
        id: "webgpu",
        label: "Graphics acceleration (WebGPU)",
        value: device.webgpu ? "Available" : "Not available",
        level: device.webgpu ? "good" : "missing",
        why: "This is what lets the larger models run at a comfortable speed.",
      },
      {
        id: "adapter",
        label: "Graphics adapter",
        value: device.adapter ?? (device.reason ?? NOT_REPORTED),
        level: device.adapter ? "good" : "info",
        why: "Names the chip the browser would hand the model to.",
      },
      {
        id: "renderer",
        label: "Drawing engine",
        value: gl.renderer ?? NOT_REPORTED,
        level: gl.software ? "caution" : gl.renderer ? "good" : "info",
        why: "A software name here means hardware acceleration is switched off somewhere.",
      },
    ],
  };

  const capabilityGroup: ReadingGroup = {
    id: "capabilities",
    heading: "Features that affect speed",
    icon: "gauge-high",
    readings: [
      {
        id: "wasm",
        label: "Processor-only mode",
        value: isCpuRuntimeSupported() ? "Supported" : "Not supported",
        level: isCpuRuntimeSupported() ? "good" : "missing",
        why: "This is the fallback used when there is no graphics acceleration.",
      },
      {
        id: "simd",
        label: "Fast maths instructions (SIMD)",
        value: wasm.simd ? "Available" : "Not available",
        level: wasm.simd ? "good" : "caution",
        why: "Without them processor-only mode is several times slower.",
      },
      {
        id: "threads",
        label: "Multi-core processor mode",
        value: wasm.threads ? "Available" : "Not available",
        level: wasm.threads ? "good" : "caution",
        why: "Shared memory lets the processor path use more than one core.",
      },
      {
        id: "isolated",
        label: "Cross-origin isolation",
        value:
          typeof window === "undefined"
            ? NOT_REPORTED
            : window.crossOriginIsolated
              ? "On"
              : "Off",
        level: "info",
        why: "A page setting that controls whether shared memory is allowed.",
      },
      {
        id: "serviceworker",
        label: "Offline support",
        value:
          typeof navigator !== "undefined" && "serviceWorker" in navigator
            ? "Supported"
            : "Not supported",
        level:
          typeof navigator !== "undefined" && "serviceWorker" in navigator ? "good" : "caution",
        why: "Needed to install this page as an app and use it without a connection.",
      },
      await storageReading(),
      {
        id: "network",
        label: "Connection",
        value: offline
          ? "Offline"
          : connection
            ? `${connection.type ?? connection.effectiveType ?? "unknown"}${
                typeof connection.downlink === "number"
                  ? `, about ${connection.downlink} Mbps`
                  : ""
              }${connection.saveData === true ? ", data saver on" : ""}`
            : NOT_REPORTED,
        level: offline ? "caution" : cellular ? "caution" : connection ? "good" : "info",
        why: "The first download is large; Wi-Fi makes it far less painful.",
      },
    ],
  };

  const groups = [deviceGroup, graphicsGroup, capabilityGroup];

  return {
    platform,
    engine: browser.engine,
    browserName: browser.name,
    browserVersion: browser.version,
    osLabel,
    webgpu: device.webgpu,
    groups,
    tips: buildTips({
      platform,
      engine: browser.engine,
      browserName: browser.name,
      webgpu: device.webgpu,
      softwareRenderer: gl.software,
      memory,
      cores,
      threads: wasm.threads,
      cellular,
      offline,
    }),
    browsers: browsersFor(platform),
    plainText: toPlainText(groups),
  };
}
