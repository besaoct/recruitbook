import type {
  RecruitBookEvent,
  RecruitBookEventHandler,
  RecruitBookEventType,
  HiredCandidatePayload,
} from "./types";

/**
 * Global Cross-Microfrontend Event Bus & Host Integration Bridge
 * 
 * Works across iframe boundaries (postMessage), custom events (window.dispatchEvent),
 * and direct in-memory subscribers for composite React shells.
 */
class RecruitBookBridge {
  private listeners: Map<string, Set<RecruitBookEventHandler>> = new Map();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleWindowMessage.bind(this));
    }
  }

  public subscribe<T = any>(
    type: RecruitBookEventType | "*",
    handler: RecruitBookEventHandler<T>,
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler as RecruitBookEventHandler);

    return () => {
      this.listeners.get(type)?.delete(handler as RecruitBookEventHandler);
    };
  }

  public emit<T = any>(type: RecruitBookEventType, payload: T): void {
    const event: RecruitBookEvent<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      source: "recruitbook-core",
    };

    // 1. Notify internal subscribers
    this.notifySubscribers(type, event);
    this.notifySubscribers("*", event);

    // 2. Dispatch DOM custom event for vanilla/microfrontend host apps
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("recruitbook:event", { detail: event }),
      );

      // 3. If running inside an iframe, post message to parent host
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ channel: "RECRUITBOOK_EVENT", event }, "*");
      }
    }
  }

  private notifySubscribers(key: string, event: RecruitBookEvent): void {
    const handlers = this.listeners.get(key);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(event);
        } catch (err) {
          console.error(`[RecruitBookBridge] Error in listener for ${key}:`, err);
        }
      });
    }
  }

  private handleWindowMessage(e: MessageEvent): void {
    if (e.data?.channel === "RECRUITBOOK_HOST_ACTION") {
      const { type, payload } = e.data;
      this.emit(type, payload);
    }
  }

  /** Helper method to trigger HRM employee conversion */
  public emitHiredToHRM(payload: HiredCandidatePayload): void {
    this.emit("candidate:hired", payload);
  }
}

export const bridge = new RecruitBookBridge();
