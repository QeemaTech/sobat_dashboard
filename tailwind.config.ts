import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sobat: {
          bg: 'rgb(var(--sobat-bg) / <alpha-value>)',
          sidebar: 'rgb(var(--sobat-sidebar) / <alpha-value>)',
          card: 'rgb(var(--sobat-card) / <alpha-value>)',
          cardHover: 'rgb(var(--sobat-card-hover) / <alpha-value>)',
          border: 'rgb(var(--sobat-border) / <alpha-value>)',
          primary: '#5B50D6',
          primaryHover: '#4A40C4',
          text: 'rgb(var(--sobat-text) / <alpha-value>)',
          textMuted: 'rgb(var(--sobat-text-muted) / <alpha-value>)',
          textDim: 'rgb(var(--sobat-text-dim) / <alpha-value>)',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
        english: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
