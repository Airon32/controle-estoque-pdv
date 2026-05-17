/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f6ec",
          100: "#e7ecd6",
          200: "#cfd9ad",
          300: "#b1c67f",
          400: "#93b35a",
          500: "#76913f",
          600: "#5d7332",
          700: "#455526",
          800: "#2d3819",
          900: "#171d0d"
        }
      }
    }
  },
  plugins: []
};
