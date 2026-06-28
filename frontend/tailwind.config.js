/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        bg2: '#111118',
        bg3: '#1a1a24',
        card: '#14141e',
        accent: '#6c63ff',
        accent2: '#00d4ff',
        border: '#2a2a3a',
        muted: '#888899',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: []
}
