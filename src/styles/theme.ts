// Design System Constants for Buete Consulting

export const colors = {
  primary: {
    50: '#f0f4ff',
    100: '#e0e8ff', 
    200: '#c7d6ff',
    300: '#a5b9ff',
    400: '#8794ff',
    500: '#6b73ff',
    600: '#4c51d9',
    700: '#3940b3',
    800: '#2a3190',
    900: '#14213d', // Main brand navy
    950: '#0f1829',
  },
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#fca311', // Main brand orange
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  neutral: {
    50: '#ffffff', // Pure white
    100: '#f9fafb',
    200: '#f4f5f6',
    300: '#e5e5e5', // Brand light gray
    400: '#d1d5db',
    500: '#9ca3af',
    600: '#6b7280',
    700: '#4b5563',
    800: '#374151',
    900: '#1f2937',
    950: '#000000', // Pure black
  },
  medical: {
    blue: '#14213d',
    green: '#059669',
    teal: '#0d9488',
    purple: '#7c3aed',
  },
  status: {
    success: '#22c55e',
    warning: '#fca311',
    error: '#ef4444',
    info: '#14213d',
  }
} as const;

export const typography = {
  fontFamily: {
    title: ['Proxima Nova', 'system-ui', 'sans-serif'],
    body: ['Merriweather', 'Georgia', 'serif'],
    caption: ['Nunito', 'system-ui', 'sans-serif'],
    sans: ['Proxima Nova', 'system-ui', 'sans-serif'],
    serif: ['Merriweather', 'Georgia', 'serif'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  }
} as const;

export const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  '2xl': '4rem',
  '3xl': '6rem',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  '4xl': '2rem',
  full: '9999px',
} as const;

export const shadows = {
  soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  large: '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.04)',
} as const;

export const animations = {
  fadeIn: 'fadeIn 0.5s ease-in-out',
  slideUp: 'slideUp 0.5s ease-out',
  pulseSlow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
} as const;

export const commonStyles = {
  // Buttons
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    primary: 'bg-primary-900 text-white hover:bg-primary-800 focus:ring-primary-500',
    secondary: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400',
    outline: 'border border-primary-900 text-primary-900 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-primary-900 hover:bg-primary-50 focus:ring-primary-500',
    sizes: {
      sm: 'px-3 py-1.5 text-sm rounded-md font-caption',
      base: 'px-4 py-2 text-base rounded-lg font-caption',
      lg: 'px-6 py-3 text-lg rounded-lg font-caption',
      xl: 'px-8 py-4 text-xl rounded-xl font-caption',
    }
  },
  
  // Cards
  card: {
    base: 'bg-white rounded-xl border border-neutral-300',
    elevated: 'bg-white rounded-xl shadow-soft',
    interactive: 'bg-white rounded-xl shadow-soft hover:shadow-medium transition-shadow duration-200',
  },
  
  // Containers
  container: {
    base: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    narrow: 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8',
    wide: 'max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8',
  },
  
  // Text styles
  text: {
    heading: {
      h1: 'text-4xl lg:text-5xl font-bold text-primary-900 font-title',
      h2: 'text-3xl lg:text-4xl font-bold text-primary-900 font-title',
      h3: 'text-2xl lg:text-3xl font-semibold text-primary-900 font-title',
      h4: 'text-xl lg:text-2xl font-semibold text-primary-900 font-title',
    },
    body: {
      large: 'text-lg text-neutral-700 font-body',
      base: 'text-base text-neutral-700 font-body',
      small: 'text-sm text-neutral-600 font-body',
    },
    caption: 'text-sm text-neutral-600 font-caption',
    accent: 'text-accent-500 font-medium font-caption',
  },
  
  // Layouts
  section: {
    base: 'py-12 lg:py-16',
    large: 'py-16 lg:py-24',
    hero: 'py-20 lg:py-32',
  }
} as const;