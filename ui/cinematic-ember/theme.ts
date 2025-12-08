/**
 * Cinematic Ember Theme Tokens
 * 
 * Reusable design tokens for the cinematic dark theme with warm orange/amber accents.
 * These tokens match the Tailwind configuration in globals.css.
 */

export const emberTheme = {
  colors: {
    // Background colors (OKLCH-based for consistent luminance)
    cinematicBlack: '#000000',
    cinematic950: 'oklch(0.08 0 0)',
    cinematic900: 'oklch(0.12 0 0)',
    cinematic800: 'oklch(0.16 0 0)',
    
    // Orange accent colors
    luminaOrange600: 'oklch(0.65 0.18 45)',
    luminaOrange500: 'oklch(0.70 0.20 45)',
    luminaOrange400: 'oklch(0.75 0.18 45)',
    
    // Amber accent colors
    luminaAmber600: 'oklch(0.68 0.16 60)',
    luminaAmber500: 'oklch(0.73 0.18 60)',
    luminaAmber400: 'oklch(0.78 0.16 60)',
    
    // Text colors
    textPrimary: '#ffffff',
    textSecondary: 'rgb(148 163 184)', // slate-400
    textMuted: 'rgb(100 116 139)', // slate-500
  },
  
  shadows: {
    // Glow shadows for depth and accent
    glowOrange: '0 0 20px oklch(0.70 0.20 45 / 0.4), 0 0 40px oklch(0.70 0.20 45 / 0.2)',
    glowOrangeLg: '0 0 30px oklch(0.70 0.20 45 / 0.5), 0 0 60px oklch(0.70 0.20 45 / 0.3)',
    glowAmber: '0 0 20px oklch(0.73 0.18 60 / 0.4), 0 0 40px oklch(0.73 0.18 60 / 0.2)',
    glowAmberLg: '0 0 30px oklch(0.73 0.18 60 / 0.5), 0 0 60px oklch(0.73 0.18 60 / 0.3)',
  },
  
  radii: {
    sm: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    '2xl': '1.5rem', // 24px
  },
  
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    '2xl': '4rem',  // 64px
  },
  
  gradients: {
    // Primary radial gradient for backgrounds
    cinematicRadial: `
      radial-gradient(circle at 50% 20%, 
        oklch(0.45 0.15 45 / 0.3) 0%, 
        oklch(0.25 0.10 45 / 0.15) 25%,
        oklch(0.15 0.05 45 / 0.05) 50%,
        transparent 80%
      ),
      radial-gradient(circle at 80% 70%, 
        oklch(0.48 0.13 60 / 0.25) 0%, 
        oklch(0.25 0.08 60 / 0.10) 30%,
        transparent 60%
      ),
      linear-gradient(180deg, 
        oklch(0.15 0.02 280) 0%, 
        oklch(0.10 0.01 280) 50%,
        oklch(0.08 0.01 280) 100%
      )
    `,
    
    // Button gradient
    ctaButton: 'linear-gradient(to right, oklch(0.65 0.18 45), oklch(0.70 0.20 45))',
    
    // Text gradient for headlines
    textOrange: 'linear-gradient(to right, #ffffff, rgb(226 232 240), oklch(0.75 0.18 45))',
    
    // Card overlays
    cardOrange: 'linear-gradient(to bottom right, oklch(0.65 0.18 45 / 0.1), transparent)',
    cardAmber: 'linear-gradient(to bottom right, oklch(0.68 0.16 60 / 0.1), transparent)',
  },
  
  animations: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      entrance: '600ms',
    },
    timing: {
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
} as const;

export type EmberTheme = typeof emberTheme;
