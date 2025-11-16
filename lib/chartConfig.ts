// Basic chart config and theming helpers for Recharts (UI-only)

export const CHART_COLORS = {
  text: {
    light: '#3f3f46',
    dark: '#e5e7eb',
  },
  grid: {
    light: '#e5e7eb',
    dark: '#3f3f46',
  },
  ci: '#22c55e', // clarity-high green
  rumination: '#ef4444', // clarity-low red
  compulsions: '#3b82f6',
  avoidance: '#f59e0b',
};

export function isDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function chartTextColor() {
  return isDark() ? CHART_COLORS.text.dark : CHART_COLORS.text.light;
}

export function chartGridColor() {
  return isDark() ? CHART_COLORS.grid.dark : CHART_COLORS.grid.light;
}
