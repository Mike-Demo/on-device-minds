/**
 * Processor-only inference path, used when the browser cannot reach the
 * graphics chip. Runs llama.cpp compiled to WebAssembly inside a worker.
 *
 * Browser-only: import it lazily from an event handler or effect, never at
 * module scope of an SSR-evaluated file (it pulls in a .wasm asset URL).
 */
import type { Wllama } from "@wllama/wllama";
import wllamaWasmUrl from "@wllama/wllama/esm/wasm/wllama.wasm?url";

import type { ChatTurn, GenerationStats, LoadProgress } from "./engine";
import { CPU_MODEL, CPU_MODEL_URL, SYSTEM_PROMPT } from "./models";

/** True when this browser can run the WebAssembly path at all. */
export function isCpuRuntimeSupported(): boolean {
  return (
    typeof WebAssembly !== "undefined" &&
    typeof Worker !== "undefined" &&
    typeof navigator !== "undefined"
  );
}

export async function createCpuEngine(
  onProgress: (progress: LoadProgress) => void,
): Promise<Wllama> {
  const { Wllama } = await import("@wllama/wllama");
  const engine = new Wllama({ default: wllamaWasmUrl }, { allowOffline: true });

  await engine.loadModelFromHF(
    { repo: CPU_MODEL.repo, file: CPU_MODEL.file },
    {
      n_ctx: 2048,
      n_gpu_layers: 0,
      progressCallback: ({ loaded, total }) => {
        const fraction = total > 0 ? loaded / total : 0;
        onProgress({
          fraction,
          text: `Downloading the processor-only model — ${Math.round(fraction * 100)}%`,
        });
      },
    },
  );

  return engine;
}

export async function isCpuModelCached(): Promise<boolean> {
  try {
    const { CacheManager } = await import("@wllama/wllama");
    const cache = new CacheManager();
    const name = await cache.getNameFromURL(CPU_MODEL_URL);
    const metadata = await cache.getMetadata(name);
    if (!metadata) return false;
    const size = await cache.getSize(name);
    return size > 0 && size === metadata.originalSize;
  } catch {
    return false;
  }
}

export async function streamCpuReply(
  engine: Wllama,
  history: readonly ChatTurn[],
  onDelta: (delta: string) => void,
): Promise<GenerationStats> {
  let stats: GenerationStats = {
    promptTokensPerSecond: null,
    decodeTokensPerSecond: null,
    completionTokens: null,
  };

  await engine.createChatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((turn) => ({ role: turn.role, content: turn.content })),
    ],
    temperature: 0.7,
    max_tokens: 512,
    timings_per_token: true,
    stream: true,
    onData: (chunk) => {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) onDelta(delta);

      if (chunk.timings || chunk.usage) {
        stats = {
          promptTokensPerSecond: chunk.timings?.prompt_per_second ?? stats.promptTokensPerSecond,
          decodeTokensPerSecond: chunk.timings?.predicted_per_second ?? stats.decodeTokensPerSecond,
          completionTokens: chunk.usage?.completion_tokens ?? stats.completionTokens,
        };
      }
    },
  });

  return stats;
}
