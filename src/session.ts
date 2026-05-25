/**
 * Generates a UUID v4. Uses crypto.randomUUID() when available (modern
 * browsers) and falls back to crypto.getRandomValues() for older mobile
 * browsers / WebViews that lack randomUUID.
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: RFC-4122 v4 via getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  return [...bytes].map((b, i) =>
    ([4, 6, 8, 10].includes(i) ? "-" : "") + b.toString(16).padStart(2, "0")
  ).join("");
}

/**
 * Generates a session ID and persists it in sessionStorage for the duration
 * of the tab session. Keyed by websiteId so multiple sites on the same page
 * do not share sessions.
 */
export function getOrCreateSessionId(websiteId: string): string {
  const storageKey = `pulse_sid_${websiteId}`;

  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;

    const id = generateUUID();
    sessionStorage.setItem(storageKey, id);
    return id;
  } catch {
    // sessionStorage unavailable (e.g. private browsing restrictions)
    return generateUUID();
  }
}
