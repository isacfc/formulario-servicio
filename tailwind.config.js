/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{html,ejs}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {colors:{verdegris: "#809484"},},
  },
  plugins: [],
}

