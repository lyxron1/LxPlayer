/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lx: {
          bg: '#09090D',
          card: '#13131A',
          elevated: '#181824',
          border: '#262638',
          borderLight: '#32324a',
          accent: 'var(--lx-accent, #8b5cf6)',
          accentHover: 'var(--lx-accent-hover, #7c3aed)',
          textMuted: '#94a3b8',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px var(--lx-accent-glow, rgba(139, 92, 246, 0.35))',
        'glow-md': '0 0 25px var(--lx-accent-glow, rgba(139, 92, 246, 0.45))',
        'glow-lg': '0 0 45px var(--lx-accent-glow, rgba(139, 92, 246, 0.55))',
      },
      backgroundImage: {
        'theme-gradient': 'linear-gradient(135deg, var(--lx-gradient-from, #8b5cf6), var(--lx-gradient-to, #6d28d9))',
        'radial-ambient': 'radial-gradient(circle at 50% 50%, var(--lx-accent-glow, rgba(139, 92, 246, 0.22)) 0%, transparent 65%)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
