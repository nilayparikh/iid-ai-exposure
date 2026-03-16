/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: { 900: "#0B0B0F", 800: "#12121a", 700: "#1a1a2e" },
        brand: {
          cyan: "#00F5FF",
          blue: "#2932FF",
          purple: "#A838FF",
          green: "#00FFB2",
          gold: "#FFB03A",
          base: "#0B0B0F",
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        mono: ["Share Tech Mono", "Consolas", "Courier New", "monospace"],
        display: ["Outfit", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
