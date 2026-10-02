import type { Config } from "tailwindcss";

const tokenColor = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // canvas
        app: tokenColor("app"),
        surface: tokenColor("surface"),
        "surface-2": tokenColor("surface-2"),
        "surface-muted": tokenColor("surface-muted"),
        "surface-overlay": tokenColor("surface-overlay"),

        // lines
        line: tokenColor("line"),
        "line-soft": tokenColor("line-soft"),

        // text
        fg: tokenColor("fg"),
        muted: tokenColor("muted"),
        subtle: tokenColor("subtle"),

        // accent / gold family
        accent: tokenColor("accent"),
        "accent-strong": tokenColor("accent-strong"),
        "accent-hover": tokenColor("accent-hover"),
        "accent-soft": tokenColor("accent-soft"),

        // primary action
        action: tokenColor("action"),
        "action-hover": tokenColor("action-hover"),
        "action-fg": tokenColor("action-fg"),

        // feedback (admin dashboard only)
        danger: tokenColor("danger"),
        "danger-hover": tokenColor("danger-hover"),
        "danger-fg": tokenColor("danger-fg"),
        "danger-soft": tokenColor("danger-soft"),
        success: tokenColor("success"),
        "success-fg": tokenColor("success-fg"),
        "success-soft": tokenColor("success-soft"),
        warning: tokenColor("warning"),
        "warning-soft": tokenColor("warning-soft"),

        // status
        "status-open": tokenColor("status-open-bg"),
        "status-open-fg": tokenColor("status-open-fg"),
        "status-closed": tokenColor("status-closed-bg"),
        "status-closed-fg": tokenColor("status-closed-fg"),

        // hero band
        "hero-bg": tokenColor("hero-bg"),
        "hero-fg": tokenColor("hero-fg"),
        "hero-fg-muted": tokenColor("hero-fg-muted"),
        "hero-accent": tokenColor("hero-accent"),
        "hero-overlay-from": tokenColor("hero-overlay-from"),

        // outer frame (around the wrapper on desktop)
        frame: tokenColor("frame"),
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "var(--font-arabic-display)",
          "Cormorant Garamond",
          "serif",
        ],
        // Admin "Dar El Baraka" wordmark — the 700 face is loaded in
        // app/admin/layout.tsx; use with `font-bold`.
        wordmark: [
          "var(--font-admin-wordmark)",
          "var(--font-display)",
          "Cormorant Garamond",
          "serif",
        ],
        sans: [
          "var(--font-body)",
          "var(--font-arabic)",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        wider: "0.08em",
        widest: "0.18em",
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--fg) / 0.05), 0 12px 32px -16px rgb(var(--fg) / 0.18)",
        "card-hover":
          "0 1px 2px rgb(var(--fg) / 0.05), 0 22px 44px -20px rgb(var(--fg) / 0.28)",
        modal: "0 30px 80px -20px rgb(var(--fg) / 0.45)",
        elevated:
          "0 0 60px -15px rgb(var(--fg) / 0.18)",

        // admin — a true drop shadow (the menu's shadows are tinted with
        // --fg, which glows cream in dark mode). --shadow / --shadow-k are
        // only defined inside .admin-root.
        "admin-xs": "0 1px 2px rgb(var(--shadow) / calc(0.05 * var(--shadow-k)))",
        "admin-sm":
          "0 1px 2px rgb(var(--shadow) / calc(0.04 * var(--shadow-k))), 0 2px 8px -2px rgb(var(--shadow) / calc(0.08 * var(--shadow-k)))",
        "admin-md":
          "0 2px 4px rgb(var(--shadow) / calc(0.04 * var(--shadow-k))), 0 12px 28px -8px rgb(var(--shadow) / calc(0.14 * var(--shadow-k)))",
        "admin-lg":
          "0 4px 10px rgb(var(--shadow) / calc(0.05 * var(--shadow-k))), 0 28px 64px -16px rgb(var(--shadow) / calc(0.26 * var(--shadow-k)))",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
