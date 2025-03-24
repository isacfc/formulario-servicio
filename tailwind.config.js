/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{html,ejs}",
    "./public/**/*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {colors:{verdegris: "#7C9383"},},
  },

  safelist: [
    "p-6", "m-2","m-6", "mb-3", "border", "rounded", "shadow-md", "bg-white", "border-gray-300","w-25","w-sm"],

  plugins: [],
}

