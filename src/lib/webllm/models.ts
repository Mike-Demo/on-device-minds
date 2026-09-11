/**
 * Browser-safe metadata about the models this app can run locally.
 * No WebLLM import here, so this module is safe on the server too.
 */

export interface OnDeviceModel {
  /** MLC model id, must match an entry in WebLLM's prebuilt app config. */
  readonly id: string;
  /** Human label shown in the picker. */
  readonly label: string;
  /** Approximate one-time download in megabytes. */
  readonly approxDownloadMb: number;
  /** One-line description of what it is good for. */
  readonly blurb: string;
}

export const ON_DEVICE_MODELS: readonly OnDeviceModel[] = [
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 0.5B Instruct",
    approxDownloadMb: 380,
    blurb: "Smallest and fastest. Good for short answers, rewriting and summaries.",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 1B Instruct",
    approxDownloadMb: 880,
    blurb: "Noticeably better conversation quality for a bigger download.",
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 1.5B Instruct",
    approxDownloadMb: 1090,
    blurb: "A strong all-rounder. Best on a desktop or a recent tablet.",
  },
  {
    id: "Phi-4-mini-instruct-q4f16_1-MLC",
    label: "Phi-4 mini Instruct",
    approxDownloadMb: 2300,
    blurb:
      "The most capable option. Needs a recent desktop or laptop with graphics acceleration and plenty of memory.",
  },
];

export const DEFAULT_MODEL_ID: string = ON_DEVICE_MODELS[0]!.id;

/** Which execution path the browser can use. */
export type RuntimeKind = "gpu" | "cpu" | "none";

export interface CpuModel {
  /** Hugging Face repository holding the GGUF file. */
  readonly repo: string;
  /** File inside that repository. */
  readonly file: string;
  readonly label: string;
  readonly approxDownloadMb: number;
  readonly blurb: string;
}

/**
 * Single model used when the browser has no graphics acceleration.
 * Runs on the processor through llama.cpp compiled to WebAssembly.
 */
export const CPU_MODEL: CpuModel = {
  repo: "bartowski/Qwen2.5-0.5B-Instruct-GGUF",
  file: "Qwen2.5-0.5B-Instruct-Q4_K_M.gguf",
  label: "Qwen2.5 0.5B Instruct (processor only)",
  approxDownloadMb: 380,
  blurb: "The only model small enough to answer at a usable speed without graphics acceleration.",
};

export const CPU_MODEL_URL = `https://huggingface.co/${CPU_MODEL.repo}/resolve/main/${CPU_MODEL.file}`;

export function findModel(id: string): OnDeviceModel {
  return ON_DEVICE_MODELS.find((model) => model.id === id) ?? ON_DEVICE_MODELS[0]!;
}

export const SYSTEM_PROMPT =
  "You are a concise assistant running entirely inside the user's web browser. " +
  "Keep answers short and direct. If a question needs knowledge or reasoning beyond " +
  "a very small model, say so plainly instead of guessing.";
