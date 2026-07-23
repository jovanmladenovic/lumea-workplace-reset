/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    fontSize: {
      xs: ['18px', '1'],
      sm: ['24px', '1'],
      base: ['32px'],
      default: ['34px'],
      lg: ['40px'],
      xl: ['48px'],
      xxl: ['54px'],
      '3xl': ['72px', '1.2'],
    },
    container: {
      center: true,
      padding: '100px',
      screens: {
        DEFAULT: '1080px',
        md: '1080px',
        lg: '1080px',
      },
    },
    extend: {
      spacing: {
        'app-w': '1080px',
        'app-h': '1920px',
      },
      fontFamily: {
        raleway: ['Raleway', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
      colors: {
        'gradient-orange': '#EAB190',
        'gradient-rose': '#EA909F',
        'gradient-purple': '#B590EA',
        'gradient-green': '#9AEA90',
        orange: '#EAB190',
        rose: '#EA909F',
        purple: '#B590EA',
        green: '#9AEA90',
        teal: '#347476',
      },
    },
  },
  plugins: [],
};
