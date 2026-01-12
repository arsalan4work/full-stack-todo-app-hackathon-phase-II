import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode using class strategy
  theme: {
    extend: {
      colors: {
        // Light mode colors
        background: '#ffffff',
        foreground: '#1f2937',

        // Dark mode colors
        darkBackground: '#111827',
        darkForeground: '#f9fafb',

        // Primary colors
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          foreground: '#ffffff',
        },
        'dark-primary': {
          DEFAULT: '#60a5fa', // blue-400
          foreground: '#1f2937',
        },

        // Secondary colors
        secondary: {
          DEFAULT: '#6b7280', // gray-500
          foreground: '#ffffff',
        },
        'dark-secondary': {
          DEFAULT: '#9ca3af', // gray-400
          foreground: '#1f2937',
        },

        // Card colors
        card: {
          DEFAULT: '#f9fafb', // gray-50
          foreground: '#1f2937',
        },
        'dark-card': {
          DEFAULT: '#1f2937', // gray-800
          foreground: '#f9fafb',
        },

        // Border colors
        border: '#e5e7eb', // gray-200
        'dark-border': '#374151', // gray-700

        // Input colors
        input: '#e5e7eb', // gray-200
        'dark-input': '#374151', // gray-700

        // Ring colors
        ring: '#3b82f6', // blue-500
        'dark-ring': '#60a5fa', // blue-400

        // Muted colors
        muted: {
          DEFAULT: '#f3f4f6', // gray-100
          foreground: '#6b7280', // gray-500
        },
        'dark-muted': {
          DEFAULT: '#374151', // gray-700
          foreground: '#9ca3af', // gray-400
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;