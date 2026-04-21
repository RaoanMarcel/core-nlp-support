/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' },
        }
      },
      animation: {
        progress: 'progress 2s ease-in-out infinite',
      },
      colors: {
        theme: {
          base: 'var(--bg-base)',
          panel: 'var(--bg-panel)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
          border: 'var(--border-color)',
        }
      },
      borderRadius: {
        'shape': 'var(--radius-default)',
        'shape-lg': 'var(--radius-panel)',
      }
    },
  },
  plugins: [],
}