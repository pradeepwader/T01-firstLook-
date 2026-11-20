/** T01 design tokens - taken from project-T01-Designs (index.html) */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#101B2D', 800: '#17243B', 700: '#263B59' },
        amber: { DEFAULT: '#F4A340', dark: '#DB8B28' },
        cream: { DEFAULT: '#F5F0E6', soft: '#FCFAF5' },
        sky: { brand: '#397CBA', soft: '#E2EDF6' },
        mint: '#DCE9E1',
      },
      fontFamily: { sans: ['Manrope', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 5px 20px rgba(23,36,59,0.07)', lift: '0 12px 32px rgba(23,36,59,0.14)' },
    },
  },
  plugins: [],
};
