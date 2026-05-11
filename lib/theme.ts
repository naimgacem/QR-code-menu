export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "light";
export const THEME_STORAGE_KEY = "deb-theme";

export const isTheme = (v: string | null): v is Theme =>
  v !== null && (THEMES as readonly string[]).includes(v);
