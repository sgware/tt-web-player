import { useCallback, useEffect, useState } from "react";

/** "system" follows the OS/browser setting; the others override it. */
export type ThemePreference = "system" | "light" | "dark";

/** Where the user's explicit choice is remembered. index.html reads the same key before first paint. */
const STORAGE_KEY = "tt-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage can be unavailable (private windows, blocked site data); fall back to the system setting.
  }
  return "system";
}

function storePreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Not remembering the choice is fine; it still applies for this page load.
  }
}

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

/**
 * The light/dark theme. Defaults to the system preference (and keeps
 * following it live) until the user picks one explicitly, which is then
 * remembered across visits.
 */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const handleChange = () => setSystemDark(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  useEffect(() => {
    applyTheme(resolved === "dark");
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    storePreference(next);
    setPreferenceState(next);
  }, []);

  return { preference, resolved, setPreference };
}
