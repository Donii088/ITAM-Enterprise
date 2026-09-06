/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'rgb(var(--color-border) / <alpha-value>)',
        ring: 'rgb(var(--color-ring) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--color-surface-raised) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
          foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
          DEFAULT: '#4f46e5',
          foreground: '#ffffff',
        },
        success: { DEFAULT: '#059669', foreground: '#ffffff' },
        warning: { DEFAULT: '#d97706', foreground: '#ffffff' },
        danger: { DEFAULT: '#e11d48', foreground: '#ffffff' },
        info: { DEFAULT: '#2563eb', foreground: '#ffffff' },
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.9375rem',
        '2xl': '1.375rem',
      },
      letterSpacing: {
        tight: '-0.015em',
        tighter: '-0.025em',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(15 23 42 / 0.04)',
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 2px 8px -2px rgb(15 23 42 / 0.06)',
        elevated: '0 4px 12px -2px rgb(15 23 42 / 0.08), 0 12px 32px -8px rgb(15 23 42 / 0.10)',
        popover: '0 4px 10px -2px rgb(15 23 42 / 0.08), 0 10px 24px -6px rgb(15 23 42 / 0.10)',
        'glow-primary': '0 0 0 1px rgb(var(--color-ring) / 0.15), 0 4px 16px -4px rgb(var(--color-ring) / 0.35)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'fade-out': { from: { opacity: 1 }, to: { opacity: 0 } },
        'scale-in': {
          from: { opacity: 0, transform: 'scale(0.96) translateY(2px)' },
          to: { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        shimmer: { from: { backgroundPosition: '150% 0' }, to: { backgroundPosition: '-50% 0' } },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
        'fade-out': 'fade-out 150ms ease-in',
        'scale-in': 'scale-in 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slide-in-left 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
