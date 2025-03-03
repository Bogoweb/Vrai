/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/*.{css,js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './src/components/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
      "font-Arial": ["Arial"],
   },},
    screens: {
      'sm': '576px',

      'md': '1300px',

      'lg': '1700px',
    },
  },
  plugins: [],
};