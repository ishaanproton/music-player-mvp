/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#121212',
        surfaceHover: '#282828',
        primary: '#1DB954', // Spotify green
        textPrimary: '#FFFFFF',
        textSecondary: '#B3B3B3',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
