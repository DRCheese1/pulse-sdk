"use client";

import { useEffect } from "react";
import { initPulse, destroyPulse, type PulseConfig } from "./index.js";

/**
 * Drop-in analytics component.
 *
 * Next.js — pass env vars as props from your layout (NEXT_PUBLIC_* substitution
 * only works in app source, not inside node_modules):
 *
 *   <PulseAnalytics
 *     endpoint={process.env.NEXT_PUBLIC_PULSE_ENDPOINT}
 *     apiKey={process.env.NEXT_PUBLIC_PULSE_API_KEY}
 *     websiteId={process.env.NEXT_PUBLIC_PULSE_WEBSITE_ID}
 *   />
 */
export interface PulseAnalyticsProps
  extends Partial<Omit<PulseConfig, "endpoint" | "apiKey" | "websiteId">> {
  endpoint?: string;
  apiKey?: string;
  websiteId?: string;
}

export function PulseAnalytics(props: PulseAnalyticsProps) {
  useEffect(() => {
    const { endpoint = "", apiKey = "", websiteId = "", ...rest } = props;
    initPulse({ endpoint, apiKey, websiteId, ...rest });
    return () => destroyPulse();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
