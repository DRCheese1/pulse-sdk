interface PulseConfig {
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
declare function initPulse(config: PulseConfig): void;
/**
 * Tear down the SDK — stops the flush timer and removes SPA listeners.
 * Useful in test environments or hot-reloading scenarios.
 */
declare function destroyPulse(): void;

export { type PulseConfig, destroyPulse, initPulse };
