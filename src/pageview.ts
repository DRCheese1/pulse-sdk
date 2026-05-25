import type { EventQueue } from "./queue.js";

interface PageviewConfig {
  queue: EventQueue;
  sessionId: string;
}

function detectCountry(): string | undefined {
  try {
    const locale = new Intl.Locale(navigator.language);
    return locale.region ?? undefined;
  } catch {
    return undefined;
  }
}

export function trackPageview(config: PageviewConfig): void {
  const path = window.location.pathname;
  console.debug(`[pulse] queuing pageview → ${path}`);
  config.queue.enqueue({
    type: "pageview",
    payload: {
      path,
      referrer: document.referrer || undefined,
      sessionId: config.sessionId,
      country: detectCountry(),
    },
  });
}
