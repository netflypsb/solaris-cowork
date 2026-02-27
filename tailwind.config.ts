import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        foreground: "#ffffff",
        surface: "#1a1a2e",
        border: "#2a2a3e",
        primary: "#6366f1",
        "primary-hover": "#818cf8",
        accent: "#10b981",
        "accent-hover": "#34d399",
        muted: "#9ca3af",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
