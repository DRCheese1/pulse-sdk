import type { QueuedEvent } from "./queue.js";

interface TransportConfig {
  endpoint: string;
  apiKey: string;
  websiteId: string;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

export function createTransport(config: TransportConfig) {
  return function send(events: QueuedEvent[]): void {
    for (const event of events) {
      const body = JSON.stringify({
        ...event.payload,
        apiKey: config.apiKey,
        websiteId: config.websiteId,
      });

      const url = `${config.endpoint}/api/v1/${event.type}`;

      // Use sendBeacon when the page is being unloaded
      if (document.visibilityState === "hidden" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {
        void sendWithRetry(url, body, 0);
      }
    }
  };
}

async function sendWithRetry(
  url: string,
  body: string,
  attempt: number
): Promise<void> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });

    if (response.ok) {
      console.debug(`[pulse] ✓ sent to ${url} (${response.status})`);
    } else if (attempt < MAX_RETRIES) {
      console.debug(`[pulse] ✗ ${response.status} from ${url}, retrying (${attempt + 1}/${MAX_RETRIES})…`);
      await delay(BASE_DELAY_MS * Math.pow(2, attempt));
      return sendWithRetry(url, body, attempt + 1);
    } else {
      console.warn(`[pulse] ✗ gave up after ${MAX_RETRIES} retries: ${url} → ${response.status}`);
    }
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.debug(`[pulse] ✗ network error, retrying (${attempt + 1}/${MAX_RETRIES})…`, err);
      await delay(BASE_DELAY_MS * Math.pow(2, attempt));
      return sendWithRetry(url, body, attempt + 1);
    } else {
      console.warn(`[pulse] ✗ gave up after ${MAX_RETRIES} retries: ${url}`, err);
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
