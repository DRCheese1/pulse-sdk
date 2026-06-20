import { EventQueue } from "./queue.js";
import { createTransport } from "./transport.js";
import { getOrCreateSessionId } from "./session.js";
import { trackPageview } from "./pageview.js";
import { attachSpaListeners } from "./spa.js";
import { collectVitals } from "./vitals.js";

export interface PulseConfig {
  /** Full URL of the Pulse API, e.g. https://analytics.example.com */
  endpoint: string;
  /** Public API key for the site */
  apiKey: string;
  /** UUID of the website registered in Pulse */
  websiteId: string;
  /**
   * Flush interval in milliseconds.
   * @default 10000
   */
  flushIntervalMs?: number;
}

let initialised = false;
let detachSpa: (() => void) | null = null;
let queue: EventQueue | null = null;

export function initPulse(config: PulseConfig): void {
  if (initialised) {
    console.debug("[pulse] already initialised, skipping.");
    return;
  }
  initialised = true;

  const { endpoint, apiKey, websiteId, flushIntervalMs = 10_000 } = config;

  if (!endpoint || !apiKey || !websiteId) {
    throw new Error("Missing required configuration for Pulse initialization.");
  }

  console.debug(`[pulse] init → endpoint: ${endpoint}  websiteId: ${websiteId}  flush: ${flushIntervalMs}ms`);

  const transport = createTransport({ endpoint, apiKey, websiteId });

  queue = new EventQueue({
    maxSize: 50,
    flushIntervalMs,
    onFlush: transport,
  });

  queue.start();

  const sessionId = getOrCreateSessionId(websiteId);

  // Track initial pageview
  trackPageview({ queue, sessionId });

  // Collect Web Vitals
  collectVitals(queue);

  // Track SPA navigations
  detachSpa = attachSpaListeners(() => {
    trackPageview({ queue: queue!, sessionId });
    collectVitals(queue!);
  });

  console.debug("[pulse] ready.");
}

/**
 * Tear down the SDK — stops the flush timer and removes SPA listeners.
 * Useful in test environments or hot-reloading scenarios.
 */
export function destroyPulse(): void {
  console.debug("[pulse] destroy.");
  queue?.stop();
  queue?.flush();
  detachSpa?.();
  queue = null;
  detachSpa = null;
  initialised = false;
}
