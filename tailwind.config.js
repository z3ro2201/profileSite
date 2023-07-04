/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
  extend: {
    animation: {
      marquee: 'marquee 25s linear infinite'
    },
    keyframes: {
      marquee: {
        '0%': { transform: 'translateX(0%)'},
        '100%': { transform: 'translateX(-100%)' }
      }
    }
  },
},
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [],
}
