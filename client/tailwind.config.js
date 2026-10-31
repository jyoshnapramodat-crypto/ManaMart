/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF5E1E',
          'orange-light': '#FFF0EB',
          green: '#0C8340',
          'green-light': '#E8F5E9',
          yellow: '#F59E0B',
          purple: '#6366F1',
          teal: '#0D9488',
          dark: '#0F172A',
          cream: '#FCFBF8',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 30px -5px rgba(255, 94, 30, 0.15)',
        'card': '0 2px 12px 0 rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
