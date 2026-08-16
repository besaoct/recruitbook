import type {
  ReqruitBookEvent,
  ReqruitBookEventHandler,
  ReqruitBookEventType,
  HiredCandidatePayload,
} from "./types";

/**
 * Global Cross-Microfrontend Event Bus & Host Integration Bridge
 * 
 * Works across iframe boundaries (postMessage), custom events (window.dispatchEvent),
 * and direct in-memory subscribers for composite React shells.
 */
class ReqruitBookBridge {
  private listeners: Map<string, Set<ReqruitBookEventHandler>> = new Map();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleWindowMessage.bind(this));
    }
  }

  public subscribe<T = any>(
    type: ReqruitBookEventType | "*",
    handler: ReqruitBookEventHandler<T>,
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler as ReqruitBookEventHandler);

    return () => {
      this.listeners.get(type)?.delete(handler as ReqruitBookEventHandler);
    };
  }

  public emit<T = any>(type: ReqruitBookEventType, payload: T): void {
    const event: ReqruitBookEvent<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      source: "reqruitbook-core",
    };

    // 1. Notify internal subscribers
    this.notifySubscribers(type, event);
    this.notifySubscribers("*", event);

    // 2. Dispatch DOM custom event for vanilla/microfrontend host apps
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("reqruitbook:event", { detail: event }),
      );

      // 3. If running inside an iframe, post message to parent host
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ channel: "REQRUITBOOK_EVENT", event }, "*");
      }
    }
  }

  private notifySubscribers(key: string, event: ReqruitBookEvent): void {
    const handlers = this.listeners.get(key);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(event);
        } catch (err) {
          console.error(`[ReqruitBookBridge] Error in listener for ${key}:`, err);
        }
      });
    }
  }

  private handleWindowMessage(e: MessageEvent): void {
    if (e.data?.channel === "REQRUITBOOK_HOST_ACTION") {
      const { type, payload } = e.data;
      this.emit(type, payload);
    }
  }

  /** Helper method to trigger HRM employee conversion */
  public emitHiredToHRM(payload: HiredCandidatePayload): void {
    this.emit("candidate:hired", payload);
  }
}

export const bridge = new ReqruitBookBridge();
