/**
 * Intercepts SPA navigation via the History API.
 * Calls `onNavigate` after a 50 ms debounce to avoid double-firing
 * when both pushState and popstate fire in some frameworks.
 */
export function attachSpaListeners(onNavigate: () => void): () => void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleNavigate(): void {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onNavigate, 50);
  }

  // Patch pushState
  const originalPushState = history.pushState.bind(history);
  history.pushState = function (...args) {
    originalPushState(...args);
    scheduleNavigate();
  };

  // Patch replaceState
  const originalReplaceState = history.replaceState.bind(history);
  history.replaceState = function (...args) {
    originalReplaceState(...args);
    scheduleNavigate();
  };

  // Back/forward navigation
  window.addEventListener("popstate", scheduleNavigate);

  return function detach(): void {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    window.removeEventListener("popstate", scheduleNavigate);
    if (debounceTimer !== null) clearTimeout(debounceTimer);
  };
}
