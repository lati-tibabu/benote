/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "vibrant-yellow": "#FFCC00",
        "bright-cyan": "#00AEEF",
        "strong-magenta": "#ED008C",
        "warm-gold": "#FFD700",
        "light-sunny": "#FFE066",
        "light-sky": "#66CFF5",
        "deep-magenta": "#A50062",
        "neutral-base": "#000000",
        "off-white": "#FDFAF5",
        "dark-gray": "#1A1A1A",
      },
      height: {
        "1/2": "2px",
        "1/4": "1px",
        "screen/2": "50vh",
      },
      borderWidth: {
        1: "1px",
        5: "5px",
        1.5: "1.5px",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        "pp-bas": {
          "primary": "#FFCC00",
          "secondary": "#00AEEF",
          "accent": "#ED008C",
          "neutral": "#000000",
          "base-100": "#FDFAF5",
          "info": "#66CFF5",
          "success": "#FFD700",
          "warning": "#FFE066",
          "error": "#A50062",
        },
      },
      "light",
    ],
  },
};
