import { onLCP, onFCP, onCLS, onINP, onTTFB } from "web-vitals";
import type { EventQueue } from "./queue.js";

function getDevice(): string {
  return /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

export function collectVitals(queue: EventQueue): void {
  const path = window.location.pathname;
  const device = getDevice();

  const report =
    (name: string) =>
    (metric: { value: number }): void => {
      console.debug(`[pulse] vital ${name} = ${metric.value}`);
      queue.enqueue({
        type: "vitals",
        payload: { name, value: metric.value, path, device },
      });
      // Flush immediately — vitals arrive one-shot
      queue.flush();
    };

  onLCP(report("LCP"), { reportAllChanges: false });
  onFCP(report("FCP"));
  onCLS(report("CLS"), { reportAllChanges: false });
  onINP(report("INP"), { reportAllChanges: false });
  onTTFB(report("TTFB"));
}
