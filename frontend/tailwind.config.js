/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "border-light": "#efefef",
        "sidebar-bg": "#fafafa",
        "user-text": "#94a3b8",
        "ai-text": "#334155",
        "accent-gray": "#f1f5f9"
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"]
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
  // experimental: {
  //   optimizeUniversalDefaults: true,
  // }
};
