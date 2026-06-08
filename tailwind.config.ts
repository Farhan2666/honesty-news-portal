import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        navy: "#001F3F",
        gold: "#FFD700",
        "soft-grey": "#F5F5F5",
        verified: "#22c55e",
      },
    },
  },
  plugins: [],
} satisfies Config;
