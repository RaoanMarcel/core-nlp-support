// tailwind.config.js
module.exports = {
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
      }
    },
  },
}