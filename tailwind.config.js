/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#10B981', hover: '#059669' },
        dark: {
          bg: '#18181B',
          card: '#27272A',
          border: '#3F3F46',
          text: { primary: '#F4F4F5', secondary: '#A1A1AA' }
        },
        light: {
           bg: '#F4F4F5',
           card: '#FFFFFF',
           border: '#E5E7EB',
           text: { primary: '#18181B', secondary: '#71717A' }
        }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    },
  },
  plugins: [],
}