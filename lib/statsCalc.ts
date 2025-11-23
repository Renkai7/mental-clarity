import type { BlockEntry, DailyMeta, Settings, Metric } from '@/types';
import { computeBlockCI, computeDailyCI } from './clarity';

export interface DayAggregates {
  date: string;
  totalR: number; totalC: number; totalA: number;
  blockTotals: Record<string, { R: number; C: number; A: number }>;
  dailyCI: number | null;
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
  sevenAvgCI: number; streakDays: number;
}

export function computeKPIs(days: DayAggregates[], settings: Settings): KPIResult {
  const today = days[0];
  const todayCI = today?.dailyCI ?? null;
  const last7 = days.slice(0,7).map(d=>d.dailyCI).filter((v): v is number => v!=null);
  const sevenAvgCI = last7.length ? avg(last7) : 0;
  // Simple streak: consecutive days from today with at least one entry
  let streak = 0;
  for (const d of days) {
    if (d.totalR + d.totalC + d.totalA > 0) streak++; else break;
  }
  return {
    todayR: today?.totalR || 0,
    todayC: today?.totalC || 0,
    todayA: today?.totalA || 0,
    todayCI,
    sevenAvgCI,
    streakDays: streak,
  };
}

export function buildSparkline(days: DayAggregates[], metric: 'CI', span = 14) {
  const slice = days.slice(0, span).reverse(); // oldest first
  return slice.map(d => ({ date: d.date, value: d.dailyCI ?? 0 }));
}

export function buildBlockAverages(days: DayAggregates[], metric: Metric, span = 7) {
  const slice = days.slice(0, span);
  const totals: Record<string, { sum: number; count: number }> = {};
  for (const d of slice) {
    for (const blockId of Object.keys(d.blockTotals)) {
      if (!totals[blockId]) totals[blockId] = { sum: 0, count: 0 };
      const block = d.blockTotals[blockId];
      const val = metric === 'R' ? block.R : metric === 'C' ? block.C : block.A;
      totals[blockId].sum += val;
      totals[blockId].count += 1;
    }
  }
  return Object.keys(totals).map(blockId => ({ blockId, average: Math.round(totals[blockId].sum / Math.max(1, totals[blockId].count)) }));
}

function avg(arr: number[]): number { return arr.reduce((s,v)=>s+v,0)/Math.max(1,arr.length); }