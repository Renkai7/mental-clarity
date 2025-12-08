import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cinematic dark backgrounds
        'cinematic-black': 'var(--cinematic-black)',
        'cinematic-950': 'var(--cinematic-950)',
        'cinematic-900': 'var(--cinematic-900)',
        'cinematic-800': 'var(--cinematic-800)',
        'cinematic-700': 'var(--cinematic-700)',
        
        // Orange accent colors (primary)
        'lumina-orange-600': 'var(--lumina-orange-600)',
        'lumina-orange-500': 'var(--lumina-orange-500)',
        'lumina-orange-400': 'var(--lumina-orange-400)',
        'lumina-orange-300': 'var(--lumina-orange-300)',
        
        // Amber accent colors (secondary)
        'lumina-amber-600': 'var(--lumina-amber-600)',
        'lumina-amber-500': 'var(--lumina-amber-500)',
        'lumina-amber-400': 'var(--lumina-amber-400)',
        'lumina-amber-300': 'var(--lumina-amber-300)',
        
        // Clarity scale for metrics
        'clarity-high': 'var(--clarity-high)',
        'clarity-medium': 'var(--clarity-medium)',
        'clarity-low': 'var(--clarity-low)',
        
        // Semantic tokens
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        ring: 'var(--ring)',
      },
      boxShadow: {
        'glow-orange': 'var(--shadow-glow-orange)',
        'glow-orange-lg': 'var(--shadow-glow-orange-lg)',
        'glow-orange-sm': 'var(--shadow-glow-orange-sm)',
        'glow-amber': 'var(--shadow-glow-amber)',
        'glow-amber-lg': 'var(--shadow-glow-amber-lg)',
      },
      animation: {
        'shooting-star': 'shooting-star 4s linear infinite',
        'drift-orb': 'drift-orb 25s linear infinite',
        'float-gentle': 'float-gentle 20s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'shooting-star': {
          '0%': { transform: 'translate(-100vw, -100vh) rotate(-45deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translate(150vw, 150vh) rotate(-45deg)', opacity: '0' },
        },
        'drift-orb': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(100vw, 120vh) scale(0.8)' },
        },
        'float-gentle': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(80vw, 100vh)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: 'var(--shadow-glow-orange)', opacity: '1' },
          '50%': { boxShadow: 'var(--shadow-glow-orange-lg)', opacity: '0.9' },
        },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius-sm)',
        lg: 'var(--radius-lg)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;