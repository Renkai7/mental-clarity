import type { CIThresholds, CICaps, Settings } from '@/types';
import { mapCIToColor, mapCountToColor } from './clarity';
// Lazy import inside function to avoid test environment alias resolution issues.

// Centralized color / threshold mapping (M10.4)

export interface ColorMappingConfig {
  ciThresholds: CIThresholds;
  caps: CICaps; // for counts normalization
}

// Async accessor to current settings-driven color config (caps + thresholds)
export async function getColorMappingConfig(): Promise<ColorMappingConfig> {
  try {
    const { getSettings } = await import('@/lib/dbUtils');
    const settings: Settings = await getSettings();
    return { ciThresholds: settings.ciThresholds, caps: settings.caps };
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[colorMapping] fallback config', e);
    }
    return { ciThresholds: { greenMin: 0.66, yellowMin: 0.33 }, caps: { maxR: 50, maxC: 30, maxA: 20 } };
  }
}

export function colorForCI(ci: number, cfg: ColorMappingConfig): string {
  return mapCIToColor(ci, cfg.ciThresholds);
}

export function colorForCount(metric: 'R' | 'C' | 'A', count: number, cfg: ColorMappingConfig): string {
  const cap = metric === 'R' ? cfg.caps.maxR : metric === 'C' ? cfg.caps.maxC : cfg.caps.maxA;
  return mapCountToColor(count, cap, cfg.ciThresholds);
}

// Composite helper for arrays of CI values
export function colorArrayForCI(values: number[], cfg: ColorMappingConfig): string[] {
  return values.map(v => colorForCI(v, cfg));
}

// Utility to derive Tailwind class from semantic color (Cinematic Ember palette)
export function heatmapColorClass(color: string): string {
  switch (color) {
    case 'green':
      return 'bg-clarity-high'; // warm green for high clarity
    case 'yellow':
      return 'bg-lumina-amber-500'; // amber for medium clarity
    case 'red':
      return 'bg-clarity-low'; // warm red-orange for low clarity
    case 'gray':
    default:
      return 'bg-cinematic-800'; // cinematic dark gray for no data
  }
}
