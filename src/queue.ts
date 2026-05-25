export interface QueuedEvent {
  type: "pageview" | "vitals" | "event";
  payload: Record<string, unknown>;
}

interface QueueConfig {
  maxSize: number;
  flushIntervalMs: number;
  onFlush: (events: QueuedEvent[]) => void;
}

export class EventQueue {
  private readonly queue: QueuedEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly config: QueueConfig;

  constructor(config: QueueConfig) {
    this.config = config;
  }

  start(): void {
    this.attachUnloadListeners();
    this.timer = setInterval(() => {
      this.flush();
    }, this.config.flushIntervalMs);
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  enqueue(event: QueuedEvent): void {
    this.queue.push(event);
    if (this.queue.length >= this.config.maxSize) {
      this.flush();
    }
  }

  flush(): void {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.queue.length);
    console.debug(`[pulse] flushing ${batch.length} event(s)`);
    this.config.onFlush(batch);
  }

  private attachUnloadListeners(): void {
    // pagehide is more reliable than beforeunload for sendBeacon
    window.addEventListener("pagehide", () => this.flush(), { passive: true });
    // visibilitychange catches tab switches on mobile
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "hidden") {
          this.flush();
        }
      },
      { passive: true }
    );
  }
}
