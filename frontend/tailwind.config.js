/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'a70': '300px',
        'a70+': '1200px',
        'smaller': '342px',
      },
      animation: {
        bounce: 'bounce 4s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-slow-reverse': 'spin 12s linear infinite reverse',
        'spin-slower': 'spin 15s linear infinite',
        'spin-slower-reverse': 'spin 20s linear infinite reverse',
        'tilt': 'tilt 10s infinite linear',
      },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        tilt: {
          '0%, 50%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(1deg)',
          },
          '75%': {
            transform: 'rotate(-1deg)',
          },
        },
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'playfair': ['Playfair Display', 'serif'],
        'righteous': ['Righteous', 'cursive'],
        'sacramento': ['Sacramento', 'cursive'],
      },
    },
  },
  plugins: [],
}
