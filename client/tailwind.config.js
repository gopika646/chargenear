/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefdf5',
          100: '#d5fae6',
          200: '#aef4cf',
          300: '#73e8af',
          400: '#32d488',
          500: '#10b981', // electric green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        navy: {
          800: '#131e3a',
          850: '#0f172a',
          900: '#0b132b',
          950: '#060b18',
        },
        electric: '#00F090',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-lg': '0 0 35px -5px rgba(0, 240, 144, 0.45)',
      }
    },
  },
  plugins: [],
}

