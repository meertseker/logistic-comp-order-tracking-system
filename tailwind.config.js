/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A84FF',
          50: '#e6f2ff',
          100: '#cce5ff',
          200: '#99ccff',
          300: '#66b3ff',
          400: '#3399ff',
          500: '#0A84FF',
          600: '#0070f3',
          700: '#005bc7',
          800: '#00469b',
          900: '#00316f',
        },
        // iOS Dark Mode System Colors
        success: '#30D158',
        warning: '#FF9F0A',
        error: '#FF453A',
        info: '#64D2FF',
        // Background Levels
        'bg-primary': '#000000',
        'bg-secondary': '#1C1C1E',
        'bg-tertiary': '#2C2C2E',
        'bg-elevated': '#3A3A3C',
        // Label/Text Colors (iOS System)
        'label-primary': '#FFFFFF',
        'label-secondary': 'rgba(235, 235, 245, 0.6)',
        'label-tertiary': 'rgba(235, 235, 245, 0.3)',
        'label-quaternary': 'rgba(235, 235, 245, 0.18)',
        // Separator Colors
        'separator': 'rgba(84, 84, 88, 0.65)',
        'separator-opaque': '#38383A',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      boxShadow: {
        'glass': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        'glass-lg': '0 8px 24px 0 rgba(0, 0, 0, 0.35)',
        'ios': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 0 rgba(0, 0, 0, 0.15)',
        'ios-lg': '0 10px 30px 0 rgba(0, 0, 0, 0.3), 0 2px 8px 0 rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'shimmer': 'shimmer 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

