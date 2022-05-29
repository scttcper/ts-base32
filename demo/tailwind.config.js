/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        gray: colors.slate,
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
