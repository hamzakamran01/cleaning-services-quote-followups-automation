import type { Config } from "tailwindcss";
import { colors, shadow } from "./src/lib/design-tokens";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        clean: {
          bg: colors.background.primary,
          surface: colors.background.surface,
          slate: colors.slate,
          teal: colors.brand.teal,
          "teal-light": colors.brand.tealLight,
          "teal-dark": colors.brand.tealDark,
        },
        brand: {
          primary: colors.brand.teal,
          "primary-light": colors.brand.tealLight,
          "primary-dark": colors.brand.tealDark,
          accent: colors.emerald.DEFAULT,
          "accent-light": colors.emerald.light,
          warning: colors.amber.DEFAULT,
          danger: colors.rose.DEFAULT,
          bg: colors.background.primary,
          surface: colors.background.surface,
          text: colors.slate[900],
          muted: colors.slate[500],
          border: "#E2E8F0",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "8px",
        input: "6px",
        button: "6px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        heading: ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        soft: shadow.sm,
        elevated: shadow.md,
        glow: shadow.lg,
      },
      ringWidth: {
        3: "3px",
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "live-pulse": "live-pulse 2s ease-in-out infinite",
        "hot-glow": "hot-glow 2s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-in": "slide-in-right 0.35s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "live-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.4)", opacity: "0.4" },
        },
        "hot-glow": {
          "0%, 100%": { borderColor: "#F59E0B" },
          "50%": { borderColor: "#FBBF24" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
