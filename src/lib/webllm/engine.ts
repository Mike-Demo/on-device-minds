/**
 * Thin service layer over WebLLM. Browser-only: import it lazily
 * (`await import("@/lib/webllm/engine")`) from an event handler or effect,
 * never at module scope of an SSR-evaluated file.
 */
import type {
  ChatCompletionMessageParam,
  InitProgressReport,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";

import { SYSTEM_PROMPT } from "./models";

export interface LoadProgress {
  /** 0 to 1. */
  readonly fraction: number;
  readonly text: string;
}

export interface ChatTurn {
  readonly role: "user" | "assistant";
  readonly content: string;
}

export interface GenerationStats {
  readonly promptTokensPerSecond: number | null;
  readonly decodeTokensPerSecond: number | null;
  readonly completionTokens: number | null;
}

interface UsageWithExtra {
  readonly completion_tokens?: number;
  readonly extra?: {
    readonly prefill_tokens_per_s?: number;
    readonly decode_tokens_per_s?: number;
  };
}

export async function createOnDeviceEngine(
  modelId: string,
  onProgress: (progress: LoadProgress) => void,
): Promise<MLCEngineInterface> {
  const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");

  const worker = new Worker(new URL("./engine.worker.ts", import.meta.url), {
    type: "module",
  });

  return CreateWebWorkerMLCEngine(worker, modelId, {
    initProgressCallback: (report: InitProgressReport) => {
      onProgress({ fraction: report.progress, text: report.text });
    },
  });
}

export async function isModelCached(modelId: string): Promise<boolean> {
  try {
    const { hasModelInCache } = await import("@mlc-ai/web-llm");
    return await hasModelInCache(modelId);
  } catch {
    return false;
  }
}

export async function streamReply(
  engine: MLCEngineInterface,
  history: readonly ChatTurn[],
  onDelta: (delta: string) => void,
): Promise<GenerationStats> {
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((turn) => ({ role: turn.role, content: turn.content })),
  ];

  const stream = await engine.chat.completions.create({
    messages,
    stream: true,
    stream_options: { include_usage: true },
    temperature: 0.7,
    max_tokens: 512,
  });

  let stats: GenerationStats = {
    promptTokensPerSecond: null,
    decodeTokensPerSecond: null,
    completionTokens: null,
  };

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) onDelta(delta);

    const usage = chunk.usage as UsageWithExtra | undefined;
    if (usage) {
      stats = {
        promptTokensPerSecond: usage.extra?.prefill_tokens_per_s ?? null,
        decodeTokensPerSecond: usage.extra?.decode_tokens_per_s ?? null,
        completionTokens: usage.completion_tokens ?? null,
      };
    }
  }

  return stats;
}
