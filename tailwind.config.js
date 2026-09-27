/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Exo 2"', 'sans-serif'],
        body: ['"Nunito"', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#05070f',
          2: '#080b1c',
          3: '#0d1130',
        },
        surface: {
          DEFAULT: '#0f1428',
          2: '#141c38',
          3: '#1a2448',
        },
        accent: {
          DEFAULT: '#6366f1',
          purple: '#8b5cf6',
          pink: '#d946ef',
          cyan: '#22d3ee',
          orange: '#fb923c',
          green: '#34d399',
          gold: '#fbbf24',
          red: '#f87171',
        },
        border: 'rgba(120,130,255,0.1)',
        text: {
          DEFAULT: '#f0f4ff',
          2: '#94a3c4',
          3: '#4a5680',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(99,102,241,0.3)',
        'glow-md': '0 0 30px rgba(99,102,241,0.4)',
        'glow-lg': '0 0 60px rgba(99,102,241,0.5)',
        'glow-purple': '0 0 30px rgba(139,92,246,0.4)',
        'glow-pink': '0 0 30px rgba(217,70,239,0.4)',
        'glow-cyan': '0 0 30px rgba(34,211,238,0.4)',
        'glow-green': '0 0 30px rgba(52,211,153,0.4)',
        'glow-gold': '0 0 30px rgba(251,191,36,0.4)',
        'card': '0 4px 40px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
        'card-hover': '0 8px 60px rgba(99,102,241,0.15), 0 1px 0 rgba(255,255,255,0.08) inset',
      },
      animation: {
        'float': 'float 7s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'orbit': 'orbit 12s linear infinite',
        'orbit-reverse': 'orbit 18s linear infinite reverse',
        'orbit-slow': 'orbit 25s linear infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'spin-reverse': 'spin-slow 15s linear infinite reverse',
        'shimmer': 'shimmer 3s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease both',
        'fade-in': 'fade-in 0.4s ease both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'gradient': 'gradient-rotate 6s ease infinite',
        'morph': 'morph 10s ease-in-out infinite',
        'twinkle': 'twinkle ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-14px) rotate(1deg)' },
          '66%': { transform: 'translateY(-7px) rotate(-1deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)', opacity: '0.8' },
          '50%': { boxShadow: '0 0 60px rgba(99,102,241,0.7), 0 0 100px rgba(217,70,239,0.3)', opacity: '1' },
        },
        orbit: {
          from: { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          to: { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'gradient-rotate': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '50%': { borderRadius: '50% 60% 30% 60% / 30% 60% 70% 40%' },
          '75%': { borderRadius: '60% 40% 60% 30% / 70% 30% 50% 60%' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
