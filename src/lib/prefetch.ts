/**
 * Browser-only helpers that pull lazily-split chunks into the HTTP cache once
 * the page is idle, so the code is already there when the visitor needs it.
 */

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
};

function onIdle(task: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const idleWindow = window as IdleWindow;
  if (typeof idleWindow.requestIdleCallback === "function") {
    idleWindow.requestIdleCallback(task, { timeout: 3000 });
    return () => {};
  }
  const id = window.setTimeout(task, 1200);
  return () => window.clearTimeout(id);
}

/** Warms the chat component chunk (and with it the Web Awesome vendor bundle). */
export function warmChatChunk(): () => void {
  return onIdle(() => {
    void import("@/components/on-device-chat");
  });
}
