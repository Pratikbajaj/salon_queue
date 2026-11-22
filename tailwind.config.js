/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          light: '#1B2740',
          card: '#131C2E',
          DEFAULT: '#0B1220',
          dark: '#080D18',
          black: '#050810',
        },
        gold: {
          light: '#F3F4F6',
          DEFAULT: '#E5B96A',
          dark: '#C99A45',
          muted: '#9CA3AF',
          subtle: '#2A3550',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};
