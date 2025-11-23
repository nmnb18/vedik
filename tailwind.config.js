/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}", // Ensures Tailwind works in components
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D1B2A",
        secondary: "#1B263B",
        tertiary: "#415A77",
        light: "#E0E1DD",
        danger: "#c5000f",
        "green-10": "#84bcab",
      },
    },
  },
  plugins: [require("tailwindcss-primeui")],
};
