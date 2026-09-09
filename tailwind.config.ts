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
        theme: {
          primary: "var(--theme-primary, #1d4ed8)",
          "primary-hover": "var(--theme-primary-hover, #1e40af)",
          secondary: "var(--theme-secondary, #475569)",
          accent: "var(--theme-accent, #f59e0b)",
          background: "var(--theme-bg, #ffffff)",
          text: "var(--theme-text, #0f172a)",
          surface: "var(--theme-surface, #f8fafc)",
          border: "var(--theme-border, #e2e8f0)",
        },
      },
      borderRadius: {
        theme: "var(--theme-radius, 0.5rem)",
      },
      fontFamily: {
        heading: ["var(--theme-font-heading, 'Inter')", "sans-serif"],
        body: ["var(--theme-font-body, 'Inter')", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
