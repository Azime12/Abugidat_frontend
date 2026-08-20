/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        tm: {
          blue: "#3B7DD8",
          "blue-light": "#E9F1FC",
          coral: "#E8703A",
          "coral-light": "#FCEAE1",
          green: "#4E9450",
          "green-light": "#E7F3E7",
          amber: "#D4A017",
          "amber-light": "#FBF1DA",
          cream: "#FBF8F2",
          white: "#FFFFFF",
          navy: "#22364A",
          muted: "#6B7684",
          border: "#E8E1D3",
          danger: "#C0392B",
          frame: "#DDD6C4",
        },
        brand: {
          navy: "#22364A",
          green: "#4E9450",
          gold: "#D4A017",
          sky: "#3B7DD8",
          coral: "#E8703A",
          cream: "#FBF8F2",
        },
        primary: {
          DEFAULT: "#3B7DD8",
          light: "#E9F1FC",
        },
        accent: {
          coral: "#E8703A",
          green: "#4E9450",
          gold: "#D4A017",
        },
        bg: "#FBF8F2",
        surface: "#FFFFFF",
        "text-main": "#22364A",
        "text-sub": "#6B7684",
        status: {
          success: "#4E9450",
          warning: "#D4A017",
          error: "#C0392B",
          info: "#3B7DD8",
          disabled: "#B0BEC5",
        },
      },
      screens: {
        xs: "320px",
        sm: "375px",
        md: "480px",
        lg: "768px",
        xl: "1024px",
        "2xl": "1280px",
        "3xl": "1536px",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hidden": {
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
        ".scroll-smooth": { "scroll-behavior": "smooth" },
      });
    },
  ],
};
