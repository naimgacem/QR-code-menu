"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME,
  isTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

type Ctx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // On mount: pick up what the anti-flash script already set on <html>,
  // so we stay in sync without re-running the resolution logic.
  useEffect(() => {
    const initial = document.documentElement.getAttribute("data-theme");
    if (isTheme(initial)) setThemeState(initial);
  }, []);

  // Reflect any state change back to the DOM.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      // ignore (private mode, etc.)
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const value = useMemo<Ctx>(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
