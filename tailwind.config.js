/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#f8fafc'
        },
        secondary: {
          DEFAULT: '#8b5cf6',
          foreground: '#f8fafc'
        },
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#facc15'
      }
    }
  },
  plugins: []
};
