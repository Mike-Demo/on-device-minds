/**
 * Dedicated worker that hosts the WebLLM engine so token generation never
 * blocks the main thread. Instantiated from `createOnDeviceEngine`.
 */
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (event: MessageEvent): void => {
  handler.onmessage(event);
};
