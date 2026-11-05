/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          center: '#1e293b',
          edge: '#0f172a',
          panel: 'rgba(15, 23, 42, 0.72)',
          border: 'rgba(148, 163, 184, 0.16)',
          sky: '#38bdf8',
          violet: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
