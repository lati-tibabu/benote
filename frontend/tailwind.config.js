/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        "1/2": "2px",
        "1/4": "1px",
      },
    },
  },
  plugins: [
    daisyui,
  ],
};
