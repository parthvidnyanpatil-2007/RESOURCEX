import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        foreground: "var(--text)",
        muted: "var(--muted)",
        campus: {
          dark: "#0a0a0c",
          darker: "#040405",
          card: "rgba(14, 14, 18, 0.7)",
          cardHover: "rgba(22, 22, 28, 0.85)",
          border: "rgba(255, 255, 255, 0.12)",
          borderGlow: "rgba(255, 255, 255, 0.25)",
          blue: "#2563EB",
          cyan: "#00D9FF",
          light: "#F8FAFC",
          muted: "#9a9a9a",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["Instrument Serif", "Times New Roman", "Times", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
