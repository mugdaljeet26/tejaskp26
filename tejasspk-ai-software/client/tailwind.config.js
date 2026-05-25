/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: { blue: '#00f2ff', purple: '#bc13fe', green: '#00ff88' },
        dark: { bg: '#05070a', card: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)' },
      },
      fontFamily: { outfit: ['Outfit', 'sans-serif'] },
      backdropBlur: { glass: '10px' },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.4s ease',
      },
      keyframes: {
        slideIn: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } }
      }
    },
  },
  plugins: [],
};
