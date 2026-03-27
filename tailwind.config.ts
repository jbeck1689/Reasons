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
        surface: {
          950: "var(--surface-950)",
          900: "var(--surface-900)",
          850: "var(--surface-850)",
          800: "var(--surface-800)",
          700: "var(--surface-700)",
          600: "var(--surface-600)",
          500: "var(--surface-500)",
          400: "var(--surface-400)",
          300: "var(--surface-300)",
          200: "var(--surface-200)",
          100: "var(--surface-100)",
          50: "var(--surface-50)",
        },
        accent: {
          950: "var(--accent-950)",
          900: "var(--accent-900)",
          800: "var(--accent-800)",
          700: "var(--accent-700)",
          600: "var(--accent-600)",
          500: "var(--accent-500)",
          400: "var(--accent-400)",
          300: "var(--accent-300)",
          200: "var(--accent-200)",
          100: "var(--accent-100)",
          50: "var(--accent-50)",
        },
        correct: {
          bg: "var(--correct-bg)",
          border: "var(--correct-border)",
          text: "var(--correct-text)",
        },
        incorrect: {
          bg: "var(--incorrect-bg)",
          border: "var(--incorrect-border)",
          text: "var(--incorrect-text)",
        },
      },
      fontFamily: {
        serif: ["var(--font-lora)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
