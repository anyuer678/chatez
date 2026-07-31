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
        // 羊皮纸色阶（背景）
        parchment: {
          50: '#faf6e8',
          100: '#f4ecd8',
          200: '#ede2c5',
          300: '#e8dbb8',
          400: '#ddc997',
          500: '#c8b27a',
          600: '#a8965c',
          700: '#857543',
          800: '#5f5230',
          900: '#3a2e1f',
        },
        // 墨水色阶（文字、边框）
        ink: {
          50: '#f0e8d8',
          100: '#d9c8a8',
          200: '#b89c6a',
          300: '#8a7558',
          400: '#5c4a32',
          500: '#3a2e1f',
          600: '#2c2418',
          700: '#1c140a',
          800: '#150f07',
          900: '#0d0904',
        },
        // 皮革棕（强调色）
        leather: {
          50: '#f0e6d2',
          100: '#dcc8a0',
          200: '#c8956c',
          300: '#b8844f',
          400: '#9a6d3d',
          500: '#8b6f47',
          600: '#6d5535',
          700: '#503d24',
          800: '#3a2c18',
          900: '#22190c',
        },
        // 信纸黄（便签装饰）
        paper: {
          50: '#fdf8e0',
          100: '#f7e9b0',
          200: '#f0d878',
          300: '#e8c87a',
          400: '#d4a574',
          500: '#c8956c',
        },
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'Georgia', 'serif'],
        sans: ['Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'monospace'],
        handwriting: ['Caveat', 'Ma Shan Zheng', 'cursive'],
        'handwriting-en': ['Caveat', 'Patrick Hand', 'cursive'],
        'handwriting-cn': ['Ma Shan Zheng', 'KaiTi', 'STKaiti', 'cursive'],
        'handwriting-code': ['Patrick Hand', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'paper-sm': '0 1px 1px rgba(58, 46, 31, 0.04), 0 2px 4px rgba(58, 46, 31, 0.06)',
        'paper': '0 1px 2px rgba(58, 46, 31, 0.06), 0 4px 8px rgba(58, 46, 31, 0.1), 0 8px 16px rgba(58, 46, 31, 0.08)',
        'paper-md': '0 2px 4px rgba(58, 46, 31, 0.08), 0 8px 16px rgba(58, 46, 31, 0.12), 0 16px 32px rgba(58, 46, 31, 0.08)',
        'paper-lg': '0 4px 8px rgba(58, 46, 31, 0.1), 0 12px 24px rgba(58, 46, 31, 0.14), 0 24px 48px rgba(58, 46, 31, 0.1)',
        'ink': '0 0 0 2px var(--accent-light), 0 2px 8px rgba(58, 46, 31, 0.12)',
        'warm-sm': '0 1px 3px rgba(44, 36, 24, 0.06)',
        'warm': '0 4px 12px rgba(44, 36, 24, 0.08)',
        'warm-md': '0 4px 16px rgba(44, 36, 24, 0.1)',
        'warm-lg': '0 8px 24px rgba(44, 36, 24, 0.12)',
        'warm-xl': '0 12px 32px rgba(44, 36, 24, 0.15)',
      },
      borderRadius: {
        'paper-sm': '6px',
        'paper': '10px',
        'paper-md': '14px',
        'paper-lg': '20px',
        'warm-sm': '6px',
        'warm': '10px',
        'warm-md': '14px',
        'warm-lg': '20px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      backgroundImage: {
        'paper-light': "url('/textures/paper-light.svg')",
        'paper-dark': "url('/textures/paper-dark.svg')",
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-warm': 'pulse-warm 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'paper-shake': 'paper-shake 0.5s ease-in-out',
        'sway': 'sway 4s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'steam-rise': 'steam-rise 2.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-warm': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'paper-shake': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(0.6deg)' },
          '75%': { transform: 'rotate(-0.6deg)' },
        },
        'sway': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'steam-rise': {
          '0%': { opacity: '0.4', transform: 'translateY(0) scale(1)' },
          '50%': { opacity: '0.7', transform: 'translateY(-4px) scale(1.05)' },
          '100%': { opacity: '0', transform: 'translateY(-8px) scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
}
