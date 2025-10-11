/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [
    require("tailwindcss-animate"), // 👈 shadcn needs this
  ]
}
