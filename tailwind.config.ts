import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1E40AF",
          "primary-light": "#3B82F6",
          accent: "#059669",
          "accent-light": "#10B981",
          warning: "#D97706",
          danger: "#DC2626",
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          text: "#0F172A",
          muted: "#64748B",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgb(15 23 42 / 0.06), 0 4px 16px -4px rgb(15 23 42 / 0.04)",
        elevated: "0 4px 6px -1px rgb(15 23 42 / 0.06), 0 10px 24px -4px rgb(15 23 42 / 0.08)",
        glow: "0 0 0 1px rgb(30 64 175 / 0.08), 0 8px 32px -8px rgb(30 64 175 / 0.2)",
        "glow-accent": "0 0 0 1px rgb(5 150 105 / 0.08), 0 8px 32px -8px rgb(5 150 105 / 0.15)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-in": "slide-in-right 0.35s ease-out forwards",
        "pulse-soft": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
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
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-primary":
          "radial-gradient(at 40% 20%, rgb(30 64 175 / 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(5 150 105 / 0.05) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
export default config;
