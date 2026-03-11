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
        // Warm charcoal backgrounds
        surface: {
          950: "#1a1714", // deepest bg
          900: "#211e19", // primary bg
          850: "#2a261f", // elevated surface
          800: "#342f27", // cards, inputs
          700: "#443d33", // borders, subtle dividers
          600: "#5c5347", // muted borders, hover states
          500: "#7a6f61", // placeholder text
          400: "#9c9083", // secondary text
          300: "#bfb3a4", // body text
          200: "#d9d0c4", // primary text
          100: "#ede7de", // headings, emphasis
          50: "#f7f3ed",  // brightest text
        },
        // Amber/gold accent
        accent: {
          950: "#2a1f0a",
          900: "#3d2d0f",
          800: "#5c4316",
          700: "#7a5a1e",
          600: "#a07528",
          500: "#c49032",
          400: "#d4a84e",
          300: "#e0be73",
          200: "#ebd49e",
          100: "#f5e8c8",
          50: "#faf4e8",
        },
        // Keep emerald for correct answers
        correct: {
          bg: "rgba(16, 85, 50, 0.2)",
          border: "#2d7a50",
          text: "#5dba82",
        },
        // Keep red-ish for incorrect (but warmer)
        incorrect: {
          bg: "rgba(120, 40, 30, 0.2)",
          border: "#9c4a3a",
          text: "#d4766a",
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
