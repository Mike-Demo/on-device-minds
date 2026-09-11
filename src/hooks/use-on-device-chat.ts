import { useCallback, useEffect, useRef, useState } from "react";
import type { MLCEngineInterface } from "@mlc-ai/web-llm";
import type { Wllama } from "@wllama/wllama/esm/index.js";

import {
  inspectDevice,
  isAppleSilicon,
  isCpuRuntimeSupported,
  type DeviceReport,
} from "@/lib/webllm/device";
import type { ChatTurn, GenerationStats, LoadProgress } from "@/lib/webllm/engine";
import { DEFAULT_CPU_MODEL_ID, DEFAULT_MODEL_ID, type RuntimeKind } from "@/lib/webllm/models";

export type EngineStatus = "checking" | "unsupported" | "idle" | "loading" | "ready" | "error";

type LoadedEngine =
  | { readonly kind: "gpu"; readonly engine: MLCEngineInterface }
  | { readonly kind: "cpu"; readonly engine: Wllama };

export interface OnDeviceChatState {
  readonly status: EngineStatus;
  readonly device: DeviceReport | null;
  readonly appleSilicon: boolean;
  readonly runtime: RuntimeKind;
  readonly modelId: string;
  readonly cpuModelId: string;
  readonly cached: boolean;
  readonly progress: LoadProgress | null;
  readonly turns: readonly ChatTurn[];
  readonly generating: boolean;
  readonly stats: GenerationStats | null;
  readonly error: string | null;
}

export interface OnDeviceChatApi extends OnDeviceChatState {
  selectModel: (modelId: string) => void;
  selectCpuModel: (modelId: string) => void;
  loadModel: () => Promise<void>;
  unloadModel: () => void;
  enableWarmStart: () => void;
  send: (prompt: string) => Promise<void>;
  reset: () => void;
}

export function useOnDeviceChat(): OnDeviceChatApi {
  const engineRef = useRef<LoadedEngine | null>(null);

  const [status, setStatus] = useState<EngineStatus>("checking");
  const [device, setDevice] = useState<DeviceReport | null>(null);
  const [appleSilicon, setAppleSilicon] = useState(false);
  const [runtime, setRuntime] = useState<RuntimeKind>("none");
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [cpuModelId, setCpuModelId] = useState<string>(DEFAULT_CPU_MODEL_ID);
  const [cached, setCached] = useState(false);
  const [progress, setProgress] = useState<LoadProgress | null>(null);
  const [turns, setTurns] = useState<readonly ChatTurn[]>([]);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const report = await inspectDevice();
      if (!active) return;
      const next: RuntimeKind = report.webgpu ? "gpu" : isCpuRuntimeSupported() ? "cpu" : "none";
      setDevice(report);
      setAppleSilicon(isAppleSilicon());
      setRuntime(next);
      setStatus(next === "none" ? "unsupported" : "idle");
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (runtime === "none") return;
    let active = true;
    void (async () => {
      try {
        if (runtime === "gpu") {
          const { isModelCached } = await import("@/lib/webllm/engine");
          const hit = await isModelCached(modelId);
          if (active) setCached(hit);
        } else {
          const { isCpuModelCached } = await import("@/lib/webllm/cpu-engine");
          const hit = await isCpuModelCached(cpuModelId);
          if (active) setCached(hit);
        }
      } catch {
        if (active) setCached(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [runtime, modelId, cpuModelId]);

  const warmed = useRef(false);
  const [warmStartAllowed, setWarmStartAllowed] = useState(false);

  /** Drop the loaded model so a different one can be chosen. */
  const unloadModel = useCallback(() => {
    warmed.current = true; // never auto-restart after a deliberate unload
    engineRef.current = null;
    setTurns([]);
    setStats(null);
    setError(null);
    setProgress(null);
    setStatus((current) => (current === "checking" || current === "unsupported" ? current : "idle"));
  }, []);

  const selectModel = useCallback(
    (next: string) => {
      setModelId((current) => {
        if (current !== next && engineRef.current) unloadModel();
        return next;
      });
    },
    [unloadModel],
  );

  const selectCpuModel = useCallback(
    (next: string) => {
      setCpuModelId((current) => {
        if (current !== next && engineRef.current) unloadModel();
        return next;
      });
    },
    [unloadModel],
  );

  const loadModel = useCallback(async () => {
    if (engineRef.current || status === "loading" || runtime === "none") return;
    setStatus("loading");
    setError(null);
    setProgress({ fraction: 0, text: "Starting download" });

    try {
      if (runtime === "gpu") {
        const { createOnDeviceEngine } = await import("@/lib/webllm/engine");
        engineRef.current = { kind: "gpu", engine: await createOnDeviceEngine(modelId, setProgress) };
      } else {
        const { createCpuEngine } = await import("@/lib/webllm/cpu-engine");
        engineRef.current = {
          kind: "cpu",
          engine: await createCpuEngine(cpuModelId, setProgress),
        };
      }
      setStatus("ready");
      setCached(true);
    } catch (cause) {
      engineRef.current = null;
      setError(cause instanceof Error ? cause.message : "The model could not be loaded.");
      setStatus("error");
    }
  }, [cpuModelId, modelId, runtime, status]);

  /** Called once the visitor has passed the pre-flight gate and can see the picker. */
  const enableWarmStart = useCallback(() => {
    setWarmStartAllowed(true);
  }, []);

  /**
   * Processor mode is slow to get going, so start the download shortly after
   * the visitor reaches the chat — but never before the gate is cleared, never
   * on a metered or offline connection, and never when the model is saved here.
   */
  useEffect(() => {
    if (!warmStartAllowed || runtime !== "cpu" || status !== "idle" || cached || warmed.current) {
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        const { isCellular, isOffline } = await import("@/lib/webllm/preflight");
        if (!active || isOffline() || isCellular()) return;
        warmed.current = true;
        void loadModel();
      })();
    }, 4000);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [cached, loadModel, runtime, status, warmStartAllowed]);

  const send = useCallback(
    async (prompt: string) => {
      const loaded = engineRef.current;
      const trimmed = prompt.trim();
      if (!loaded || generating || trimmed.length === 0) return;

      const history: ChatTurn[] = [...turns, { role: "user", content: trimmed }];
      setTurns([...history, { role: "assistant", content: "" }]);
      setGenerating(true);
      setStats(null);
      setError(null);

      try {
        let answer = "";
        const onDelta = (delta: string): void => {
          answer += delta;
          setTurns([...history, { role: "assistant", content: answer }]);
        };

        if (loaded.kind === "gpu") {
          const { streamReply } = await import("@/lib/webllm/engine");
          setStats(await streamReply(loaded.engine, history, onDelta));
        } else {
          const { streamCpuReply } = await import("@/lib/webllm/cpu-engine");
          setStats(await streamCpuReply(loaded.engine, history, onDelta));
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Generation failed.");
        setTurns(history);
      } finally {
        setGenerating(false);
      }
    },
    [generating, turns],
  );

  const reset = useCallback(() => {
    setTurns([]);
    setStats(null);
    setError(null);
    const loaded = engineRef.current;
    if (loaded?.kind === "gpu") void loaded.engine.resetChat();
  }, []);

  return {
    status,
    device,
    appleSilicon,
    runtime,
    modelId,
    cpuModelId,
    cached,
    progress,
    turns,
    generating,
    stats,
    error,
    selectModel,
    selectCpuModel,
    loadModel,
    send,
    reset,
  };
}
