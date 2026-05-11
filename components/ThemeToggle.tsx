"use client";

import { useTheme } from "./ThemeProvider";

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      aria-pressed={isDark}
      className="grid h-8 w-8 touch-manipulation place-items-center rounded-full border border-hero-accent/30 bg-hero-bg/50 text-hero-fg backdrop-blur-md transition hover:bg-hero-bg/80 active:scale-[0.96]"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
