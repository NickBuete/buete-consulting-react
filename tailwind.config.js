/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          200: '#c7d6ff',
          300: '#a5b9ff',
          400: '#8794ff',
          500: '#6b73ff',
          600: '#14213d',
          700: '#0f1a2e',
          800: '#0c1423',
          900: '#14213d',
        },
        accent: {
          50: '#fffbf0',
          100: '#fff6e0',
          200: '#ffecb8',
          300: '#ffe085',
          400: '#ffd24a',
          500: '#fca311',
          600: '#e6920f',
          700: '#cc820e',
          800: '#b3730c',
          900: '#99630a',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      }
    },
  },
}