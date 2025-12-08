// Cinematic Ember chart config and theming helpers for Recharts

export const CHART_COLORS = {
  text: {
    light: 'rgb(100 116 139)', // slate-500
    dark: 'rgb(226 232 240)', // slate-200
  },
  grid: {
    light: 'rgb(226 232 240)', // slate-200
    dark: 'oklch(0.16 0 0)', // cinematic-800
  },
  // Cinematic Ember palette for metrics
  ci: 'oklch(0.70 0.18 150)', // clarity-high warm green
  rumination: 'oklch(0.65 0.20 30)', // clarity-low warm red-orange
  compulsions: 'oklch(0.70 0.20 45)', // lumina-orange-500
  avoidance: 'oklch(0.73 0.18 60)', // lumina-amber-500
  
  // Additional accent colors
  orange: 'oklch(0.70 0.20 45)', // lumina-orange-500
  amber: 'oklch(0.73 0.18 60)', // lumina-amber-500
  orangeLight: 'oklch(0.75 0.18 45)', // lumina-orange-400
  amberLight: 'oklch(0.78 0.16 60)', // lumina-amber-400
};

export function isDark(): boolean {
  if (typeof window === 'undefined') return true; // Default to dark (Cinematic Ember is dark theme)
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function chartTextColor() {
  return isDark() ? CHART_COLORS.text.dark : CHART_COLORS.text.light;
}

export function chartGridColor() {
  return isDark() ? CHART_COLORS.grid.dark : CHART_COLORS.grid.light;
}
