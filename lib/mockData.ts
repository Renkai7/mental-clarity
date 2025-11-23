// Mock data provider for Main Metric Grid (M2.1)
// Generates ~30 days of records with realistic ranges per metric.

import { colorForCI, colorForCount, getColorMappingConfig } from './colorMapping';
import type { CIThresholds, CICaps } from '@/types';

export type MetricCode = 'R' | 'C' | 'A';

export interface MainGridRow {
  date: string; // YYYY-MM-DD
  total: number;
  timeframes: Record<string, number>; // key = blockId/label, value = count
}

// Ordered timeframe block labels (will align later with real BlockConfig defaults)
export const DEFAULT_TIMEFRAMES: string[] = [
  'Wake-9AM',
  '9AM-12PM',
  '12PM-3PM',
  '3PM-6PM',
  '6PM-9PM',
  '9PM-Morning',
];

// Range map per metric for per-timeframe counts
const RANGE: Record<MetricCode, { min: number; max: number }> = {
  R: { min: 0, max: 20 },
  C: { min: 0, max: 15 },
  A: { min: 0, max: 10 },
};

// Simple deterministic pseudo-random helper (seeded by date + metric)
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    // Convert to [0,1)
    return (h >>> 0) / 4294967295;
  };
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function getMockMainGridData(metric: MetricCode): MainGridRow[] {
  const days = 30;
  const today = new Date();
  const rows: MainGridRow[] = [];
  const range = RANGE[metric];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = formatDate(date);
    const rand = seededRandom(metric + dateStr);

    const timeframes: Record<string, number> = {};
    let total = 0;
    DEFAULT_TIMEFRAMES.forEach((label, idx) => {
      // Bias variation by index to make earlier blocks sometimes higher
      const base = rand();
      const value = Math.round(base * (range.max - range.min) + range.min * (0.3 + (idx / DEFAULT_TIMEFRAMES.length) * 0.2));
      timeframes[label] = value;
      total += value;
    });

    rows.push({ date: dateStr, total, timeframes });
  }

  // Sort descending by date (most recent first)
  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  return rows;
}

// Convenience bulk export for all metrics if needed later
export function getAllMockMainGridData() {
  return {
    R: getMockMainGridData('R'),
    C: getMockMainGridData('C'),
    A: getMockMainGridData('A'),
  };
}

// -----------------------------
// Heatmap mock data (M4.3)
// -----------------------------

export type HeatmapMetric = 'CI' | 'R' | 'C' | 'A';

export type HeatmapColor = 'green' | 'yellow' | 'red' | 'gray';

export interface HeatmapBlock {
  blockId: string; // matches DEFAULT_TIMEFRAMES label for now
  value: number | null; // CI will be 0..1, counts are >=0; null indicates missing -> gray
  color: HeatmapColor;
}

export interface HeatmapDayData {
  date: string; // YYYY-MM-DD
  blocks: HeatmapBlock[]; // fixed 6 blocks in order of DEFAULT_TIMEFRAMES
}


// Centralized color mapping config (M10.4)
// Runtime mutable color config sourced from settings. Initialized with defaults.
let COLOR_CFG: { ciThresholds: CIThresholds; caps: CICaps } = {
  ciThresholds: { greenMin: 0.66, yellowMin: 0.33 },
  caps: { maxR: RANGE.R.max, maxC: RANGE.C.max, maxA: RANGE.A.max },
};
// Load dynamic settings on module use (non-blocking). Consumers can call refreshColorConfig() if needed.
export async function refreshColorConfig() {
  const cfg = await getColorMappingConfig();
  COLOR_CFG = cfg as any;
}
// Kick off initial async load (fire and forget)
void refreshColorConfig();

// Deterministic CI generator using the seededRandom; values in [0,1]
function seededCI(rand: () => number): number {
  // Bias towards middle with some spread
  const a = rand();
  const b = rand();
  // Average two uniforms to get a triangular distribution
  const v = (a + b) / 2;
  return Math.max(0, Math.min(1, v));
}

export function getMockHeatmapData(metric: HeatmapMetric, days = 30, offsetDays = 0): HeatmapDayData[] {
  const today = new Date();
  const rows: HeatmapDayData[] = [];

  for (let i = offsetDays; i < offsetDays + days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);
    const rand = seededRandom(metric + dateStr);

    const blocks: HeatmapBlock[] = DEFAULT_TIMEFRAMES.map((label, idx) => {
      // Introduce occasional missing data (~8%)
      const missing = rand() < 0.08;
      if (missing) {
        return { blockId: label, value: null, color: 'gray' };
      }

      if (metric === 'CI') {
        const ci = seededCI(rand);
        const color = colorForCI(ci, COLOR_CFG) as HeatmapColor;
        return { blockId: label, value: Number(ci.toFixed(2)), color };
      }

      // Counts for R/C/A with mild block-dependent variance
      const range = RANGE[metric as MetricCode];
      const base = rand();
      const bias = 0.2 + (idx / DEFAULT_TIMEFRAMES.length) * 0.3; // later blocks slightly higher
      const val = Math.round(base * (range.max - range.min) + range.min * bias);
      const color = colorForCount(metric as MetricCode, val, COLOR_CFG) as HeatmapColor;
      return { blockId: label, value: val, color };
    });

    rows.push({ date: dateStr, blocks });
  }

  // Sort descending by date (most recent first)
  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  return rows;
}
