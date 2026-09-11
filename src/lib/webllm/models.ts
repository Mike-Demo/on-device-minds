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
    blurb: "Strongest of the three. Best on a desktop or a recent tablet.",
  },
];

export const DEFAULT_MODEL_ID: string = ON_DEVICE_MODELS[0]!.id;

export function findModel(id: string): OnDeviceModel {
  return ON_DEVICE_MODELS.find((model) => model.id === id) ?? ON_DEVICE_MODELS[0]!;
}

export const SYSTEM_PROMPT =
  "You are a concise assistant running entirely inside the user's web browser. " +
  "Keep answers short and direct. If a question needs knowledge or reasoning beyond " +
  "a very small model, say so plainly instead of guessing.";
