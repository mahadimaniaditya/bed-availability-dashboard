/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['Sora', 'sans-serif'], impact: ['Anton', 'Impact', 'sans-serif'], sans: ['Figtree', 'system-ui', 'sans-serif'] },
      colors: { ink: '#0f2a2e', brand: { 50: '#effcf9', 100: '#c8f5ec', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 900: '#06312f' } },
    },
  },
  plugins: [],
}
