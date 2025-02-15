module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(192,192,192,0.3)',
      },
    },
  },
  plugins: [],
}
