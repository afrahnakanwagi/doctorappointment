/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#FFD2FE',
        'card': '#FCEBFF',
        'navbar': '#FCEBFF',
        'button': '#54074E',
        'icon': '#EA3EF7',
      },
    },
  },
  plugins: [],
}
