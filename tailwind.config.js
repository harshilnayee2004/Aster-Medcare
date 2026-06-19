/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0f172a",
        muted: "#667085",
        line: "#e5eaf1",
        brand: "#0b5fe8",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};
