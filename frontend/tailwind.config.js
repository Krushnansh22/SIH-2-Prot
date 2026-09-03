/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nyaya: {
          50: '#fffdf5',
          100: '#fef7e6',
          200: '#fceeb8',
          300: '#f7d77a',
          400: '#f3c655',
          500: '#e9b23b',
          600: '#d79a2d',
          700: '#b77e1d',
          800: '#8a5d1d',
          900: '#66471a',
          950: '#362811',
        },
        vault: {
          bg: '#f9f3dc',
          card: '#fffdf7',
          surface: '#f4ebce',
          border: '#e7d7a8',
          hover: '#f7ecce',
          gold: '#d9a63a',
          emerald: '#7aa36d',
          crimson: '#b95c4f',
          cyan: '#d8b45a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2.5s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
