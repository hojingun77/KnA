import theme from './src/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: theme.colors,
      fontFamily: theme.fonts,
    },
  },
  plugins: [],
};
