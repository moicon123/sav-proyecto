/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sav: {
          primary: '#1a1f36',
          accent: '#D4AF37',
          success: '#d4edbc',
          mint: '#00C853',
          dark: '#004D40',
          vip: '#22c55e',
          vipLight: '#86efac',
        }
      }
    },
  },
  plugins: [],
}
