import type { BlockEntry, DailyMeta, Settings, Metric } from '@/types';
import { computeBlockCI, computeDailyCI } from './clarity';

export interface DayAggregates {
  date: string;
  totalR: number; totalC: number; totalA: number;
  blockTotals: Record<string, { R: number; C: number; A: number }>;
  dailyCI: number | null;
}

/**
 * Determine if a day has been actively tracked (vs auto-created empty).
 * A day is tracked if the user explicitly marked it as tracked.
 * 
 * @param dailyMeta - Daily metadata for the day
 * @returns true if the day has been tracked by the user
 */
export function isTrackedDay(dailyMeta?: DailyMeta | null): boolean {
  if (!dailyMeta) return false;
  return dailyMeta.tracked === true;
}

// Build per-day aggregates from entries & meta
export function buildDayAggregates(entries: BlockEntry[], dailyMeta: DailyMeta[], settings: Settings): DayAggregates[] {
  const byDate: Record<string, DayAggregates> = {};
  const metaMap: Record<string, DailyMeta> = Object.fromEntries(dailyMeta.map(m => [m.date, m]));
  for (const e of entries) {
    if (!byDate[e.date]) {
      byDate[e.date] = {
        date: e.date,
        totalR: 0, totalC: 0, totalA: 0,
        blockTotals: {},
        dailyCI: metaMap[e.date]?.dailyCI ?? null,
      };
    }
    const d = byDate[e.date];
    if (!d.blockTotals[e.blockId]) d.blockTotals[e.blockId] = { R: 0, C: 0, A: 0 };
    d.blockTotals[e.blockId].R += e.ruminationCount;
    d.blockTotals[e.blockId].C += e.compulsionsCount;
    d.blockTotals[e.blockId].A += e.avoidanceCount;
    d.totalR += e.ruminationCount;
    d.totalC += e.compulsionsCount;
    d.totalA += e.avoidanceCount;
  }

  // Compute dailyCI if missing but meta exists
  for (const agg of Object.values(byDate)) {
    if (agg.dailyCI == null && metaMap[agg.date]) {
      const blocks = entries.filter(e => e.date === agg.date);
      const blockCIs = blocks.map(b => computeBlockCI(b, settings.ciWeights, settings.caps));
      agg.dailyCI = computeDailyCI(blockCIs, metaMap[agg.date], settings.ciWeights, settings.goals);
    }
  }
  return Object.values(byDate).sort((a,b)=> a.date < b.date ? 1 : -1);
}

export interface KPIResult {
  todayR: number; todayC: number; todayA: number; todayCI: number | null;
  todayIsTracked: boolean;
  sevenAvgCI: number | null;
  sevenTrackedCount: number;
  streakDays: number;
}

export function computeKPIs(days: DayAggregates[], dailyMetaList: DailyMeta[]): KPIResult {
  const today = days[0];
  const todayMeta = dailyMetaList.find(m => m.date === today?.date);
  const todayIsTracked = today ? isTrackedDay(todayMeta) : false;
  
  // Show CI if tracked, otherwise null
  const todayCI = todayIsTracked ? (today?.dailyCI ?? null) : null;
  
  // Only include tracked days in 7-day average
  const last7 = days.slice(0, 7);
  const last7Tracked = last7.filter(d => {
    const meta = dailyMetaList.find(m => m.date === d.date);
    return isTrackedDay(meta);
  });
  
  const last7CIs = last7Tracked
    .map(d => d.dailyCI)
    .filter((v): v is number => v != null);
  
  const sevenAvgCI = last7CIs.length ? avg(last7CIs) : null;
  const sevenTrackedCount = last7Tracked.length;
  
  // Count consecutive tracked days from today
  let streak = 0;
  for (const d of days) {
    const meta = dailyMetaList.find(m => m.date === d.date);
    if (isTrackedDay(meta)) {
      streak++;
    } else {
      break; // Stop at first untracked day
    }
  }
  
  return {
    todayR: today?.totalR || 0,
    todayC: today?.totalC || 0,
    todayA: today?.totalA || 0,
    todayCI,
    todayIsTracked,
    sevenAvgCI,
    sevenTrackedCount,
    streakDays: streak,
  };
}

export function buildSparkline(days: DayAggregates[], metric: 'CI', span = 14) {
  const slice = days.slice(0, span).reverse(); // oldest first
  return slice.map(d => ({ date: d.date, value: d.dailyCI ?? 0 }));
}

export function buildBlockAverages(
  days: DayAggregates[], 
  dailyMetaList: DailyMeta[], 
  metric: Metric, 
  span = 7
): Array<{ blockId: string; average: number; trackedDays: number }> {
  // Only include tracked days
  const trackedDays = days.slice(0, span).filter(d => {
    const meta = dailyMetaList.find(m => m.date === d.date);
    return isTrackedDay(meta);
  });
  
  const totals: Record<string, number> = {};
  const counts: Record<string, number> = {};
  
  // Sum up values for each block across tracked days only
  for (const d of trackedDays) {
    for (const blockId of Object.keys(d.blockTotals)) {
      if (!totals[blockId]) {
        totals[blockId] = 0;
        counts[blockId] = 0;
      }
      const block = d.blockTotals[blockId];
      const val = metric === 'R' ? block.R : metric === 'C' ? block.C : block.A;
      totals[blockId] += val;
      counts[blockId]++;
    }
  }
  
  // Calculate average over tracked days only
  return Object.keys(totals).map(blockId => ({ 
    blockId, 
    average: counts[blockId] > 0 ? Math.round(totals[blockId] / counts[blockId]) : 0,
    trackedDays: counts[blockId]
  }));
}

function avg(arr: number[]): number { return arr.reduce((s,v)=>s+v,0)/Math.max(1,arr.length); }