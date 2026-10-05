/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: {
          1: '#121215',
          2: '#18181b',
          3: '#27272a',
        },
        border: {
          subtle: '#27272a',
          hover: '#3f3f46',
        },
        ludo: {
          red: {
            DEFAULT: '#e11d48',
            dark: '#be123c',
            light: '#fda4af',
            muted: 'rgba(225, 29, 72, 0.15)',
          },
          green: {
            DEFAULT: '#10b981',
            dark: '#047857',
            light: '#6ee7b7',
            muted: 'rgba(16, 185, 129, 0.15)',
          },
          yellow: {
            DEFAULT: '#f59e0b',
            dark: '#b45309',
            light: '#fde68a',
            muted: 'rgba(245, 158, 11, 0.15)',
          },
          blue: {
            DEFAULT: '#0ea5e9',
            dark: '#0369a1',
            light: '#7dd3fc',
            muted: 'rgba(14, 165, 233, 0.15)',
          },
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.35s ease-in-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%, 60%': { transform: 'rotate(-8deg)' },
          '40%, 80%': { transform: 'rotate(8deg)' },
        }
      }
    },
  },
  plugins: [],
}
