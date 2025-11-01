const DISPLAY_MODES = ["fullscreen", "standalone", "minimal-ui"] as const;

const isBrowser = typeof window !== "undefined";

function supportsDisplayModeQueries(): boolean {
  return Boolean(isBrowser && window.matchMedia);
}

function matchesDisplayMode(): boolean {
  if (!supportsDisplayModeQueries()) return false;

  return DISPLAY_MODES.some((mode) => {
    try {
      return window.matchMedia(`(display-mode: ${mode})`).matches;
    } catch {
      return false;
    }
  });
}

function hasNavigatorStandalone(): boolean {
  if (typeof navigator === "undefined") return false;
  if (!("standalone" in navigator)) return false;
  const maybeNavigator = navigator as Navigator & { standalone?: unknown };
  return Boolean(maybeNavigator.standalone);
}

function referrerIndicatesPwa(): boolean {
  if (typeof document === "undefined") return false;
  return document.referrer?.startsWith("android-app://") ?? false;
}

/**
 * Detects whether the current runtime is a standalone PWA experience.
 * Works across Chromium, iOS Safari, and fallback heuristics.
 */
export function isPwaEnvironment(): boolean {
  if (!isBrowser) return false;
  return matchesDisplayMode() || hasNavigatorStandalone() || referrerIndicatesPwa();
}

type ChangeCallback = () => void;

/**
 * Subscribes to PWA related environment changes (display-mode, install events, visibility).
 * Returns an unsubscribe callback.
 */
export function subscribeToPwaChanges(callback: ChangeCallback): () => void {
  if (!isBrowser) {
    return () => {};
  }

  const mediaQueries = supportsDisplayModeQueries()
    ? DISPLAY_MODES.map((mode) => {
        try {
          return window.matchMedia(`(display-mode: ${mode})`);
        } catch {
          return undefined;
        }
      }).filter(Boolean)
    : [];

  mediaQueries.forEach((query) => {
    if (!query) return;
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", callback);
    } else if (typeof query.addListener === "function") {
      query.addListener(callback);
    }
  });

  const handleVisibilityChange = () => callback();
  const handleAppInstalled = () => callback();

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("appinstalled", handleAppInstalled);

  return () => {
    mediaQueries.forEach((query) => {
      if (!query) return;
      if (typeof query.removeEventListener === "function") {
        query.removeEventListener("change", callback);
      } else if (typeof query.removeListener === "function") {
        query.removeListener(callback);
      }
    });

    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("appinstalled", handleAppInstalled);
  };
}
