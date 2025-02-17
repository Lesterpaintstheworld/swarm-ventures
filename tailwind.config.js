/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'silver': '#C0C0C0',
        'light-silver': '#E8E8E8',
        'dark-silver': '#707070',
        'dark-gray': '#1a1a1a',
        'black': '#000000',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(192,192,192,0.3)',
      },
    },
  },
  plugins: [],
}
