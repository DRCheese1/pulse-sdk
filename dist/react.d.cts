import { PulseConfig } from './index.cjs';

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
interface PulseAnalyticsProps extends Partial<Omit<PulseConfig, "endpoint" | "apiKey" | "websiteId">> {
    endpoint?: string;
    apiKey?: string;
    websiteId?: string;
}
declare function PulseAnalytics(props: PulseAnalyticsProps): null;

export { PulseAnalytics, type PulseAnalyticsProps };
