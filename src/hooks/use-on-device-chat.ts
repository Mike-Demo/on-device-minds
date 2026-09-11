import { useCallback, useEffect, useRef, useState } from "react";
import type { MLCEngineInterface } from "@mlc-ai/web-llm";

import { inspectDevice, isAppleSilicon, type DeviceReport } from "@/lib/webllm/device";
import type { ChatTurn, GenerationStats, LoadProgress } from "@/lib/webllm/engine";
import { DEFAULT_MODEL_ID } from "@/lib/webllm/models";

export type EngineStatus = "checking" | "unsupported" | "idle" | "loading" | "ready" | "error";

export interface OnDeviceChatState {
  readonly status: EngineStatus;
  readonly device: DeviceReport | null;
  readonly appleSilicon: boolean;
  readonly modelId: string;
  readonly cached: boolean;
  readonly progress: LoadProgress | null;
  readonly turns: readonly ChatTurn[];
  readonly generating: boolean;
  readonly stats: GenerationStats | null;
  readonly error: string | null;
}

export interface OnDeviceChatApi extends OnDeviceChatState {
  selectModel: (modelId: string) => void;
  loadModel: () => Promise<void>;
  send: (prompt: string) => Promise<void>;
  reset: () => void;
}

export function useOnDeviceChat(): OnDeviceChatApi {
  const engineRef = useRef<MLCEngineInterface | null>(null);

  const [status, setStatus] = useState<EngineStatus>("checking");
  const [device, setDevice] = useState<DeviceReport | null>(null);
  const [appleSilicon, setAppleSilicon] = useState(false);
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
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
      setDevice(report);
      setAppleSilicon(isAppleSilicon());
      setStatus(report.webgpu ? "idle" : "unsupported");
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!device?.webgpu) return;
    let active = true;
    void (async () => {
      const { isModelCached } = await import("@/lib/webllm/engine");
      const hit = await isModelCached(modelId);
      if (active) setCached(hit);
    })();
    return () => {
      active = false;
    };
  }, [device, modelId]);

  const selectModel = useCallback((next: string) => {
    if (engineRef.current) return;
    setModelId(next);
  }, []);

  const loadModel = useCallback(async () => {
    if (engineRef.current || status === "loading") return;
    setStatus("loading");
    setError(null);
    setProgress({ fraction: 0, text: "Starting download" });

    try {
      const { createOnDeviceEngine } = await import("@/lib/webllm/engine");
      engineRef.current = await createOnDeviceEngine(modelId, setProgress);
      setStatus("ready");
      setCached(true);
    } catch (cause) {
      engineRef.current = null;
      setError(cause instanceof Error ? cause.message : "The model could not be loaded.");
      setStatus("error");
    }
  }, [modelId, status]);

  const send = useCallback(
    async (prompt: string) => {
      const engine = engineRef.current;
      const trimmed = prompt.trim();
      if (!engine || generating || trimmed.length === 0) return;

      const history: ChatTurn[] = [...turns, { role: "user", content: trimmed }];
      setTurns([...history, { role: "assistant", content: "" }]);
      setGenerating(true);
      setStats(null);
      setError(null);

      try {
        const { streamReply } = await import("@/lib/webllm/engine");
        let answer = "";
        const result = await streamReply(engine, history, (delta) => {
          answer += delta;
          setTurns([...history, { role: "assistant", content: answer }]);
        });
        setStats(result);
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
    void engineRef.current?.resetChat();
  }, []);

  return {
    status,
    device,
    appleSilicon,
    modelId,
    cached,
    progress,
    turns,
    generating,
    stats,
    error,
    selectModel,
    loadModel,
    send,
    reset,
  };
}
