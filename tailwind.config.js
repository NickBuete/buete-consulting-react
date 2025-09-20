/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors (renamed to avoid conflicts)
        brand: {
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
        orange: {
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
        // shadcn/ui semantic color system
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        'heading': ['Merriweather', 'serif'],
        'body': ['Nunito', 'sans-serif'],
        'brand': ['Proxima Nova', 'Nunito', 'sans-serif'],
      },
    },
  },
}