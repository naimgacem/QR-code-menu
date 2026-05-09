import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F0E0C",
          900: "#15130F",
          800: "#1C1A15",
          700: "#2A2620",
        },
        sand: {
          50: "#FBF7EC",
          100: "#F6EFDD",
          200: "#EDE3C8",
          300: "#E0D0A8",
          400: "#C9B07F",
        },
        gold: {
          DEFAULT: "#B68A35",
          light: "#C9A24A",
          deep: "#7A5817",
        },
        terracotta: {
          DEFAULT: "#A85C32",
          deep: "#7E3F1F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        wider: "0.08em",
        widest: "0.18em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,14,12,0.05), 0 12px 32px -16px rgba(15,14,12,0.18)",
        "card-hover":
          "0 1px 2px rgba(15,14,12,0.05), 0 22px 44px -20px rgba(15,14,12,0.28)",
      },
      backgroundImage: {
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
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
