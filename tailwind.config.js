/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest-green': '#228B22',
        'sage-green': '#9CAF88',
        'earth-brown': '#8B4513',
        'sky-blue': '#87CEEB',
        'leaf-green': '#32CD32',
        'soil-brown': '#A0522D',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 