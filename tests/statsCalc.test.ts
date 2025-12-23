import { describe, it, expect } from 'vitest';
import { buildDayAggregates, computeKPIs, buildSparkline, buildBlockAverages } from '../lib/statsCalc';
import type { BlockEntry, DailyMeta, Settings } from '../types';

// Minimal settings fixture
const settings: Settings = {
  blocks: [
    { id: 'b1', label: 'Wake-9AM', start: '06:00', end: '09:00', order: 0, active: true },
    { id: 'b2', label: '9AM-12PM', start: '09:00', end: '12:00', order: 1, active: true },
  ],
  goals: { R: 10, C: 8, A: 5, exerciseMinutes: 30, minSleepQuality: 6 },
  ciWeights: { alphaR: .30, alphaC: .25, alphaA: .20, alphaAnx: .15, alphaStr: .10, betaSleep: .05, betaEx: .05 },
  ciThresholds: { greenMin: 0.66, yellowMin: 0.33 },
  caps: { maxR: 20, maxC: 15, maxA: 10 },
  defaultTab: 'R',
  heatmapMetric: 'CI',
};

// Build 5 days of deterministic entries
function makeEntries(): BlockEntry[] {
  const days: BlockEntry[] = [];
  for (let i=0;i<5;i++) {
    const date = new Date();
    date.setDate(date.getDate()-i);
    const ds = date.toISOString().slice(0,10);
    // Two blocks per day
    days.push({ id: `e${i}a`, date: ds, blockId: 'b1', ruminationCount: i+1, compulsionsCount: 2, avoidanceCount: 1, anxietyScore: 5, stressScore: 4, notes: '', createdAt: ds+'T00:00:00Z', updatedAt: ds+'T00:00:00Z' });
    days.push({ id: `e${i}b`, date: ds, blockId: 'b2', ruminationCount: (i+1)*2, compulsionsCount: 1, avoidanceCount: 0, anxietyScore: 4, stressScore: 3, notes: '', createdAt: ds+'T00:00:00Z', updatedAt: ds+'T00:00:00Z' });
  }
  return days;
}

function makeMeta(): DailyMeta[] {
  const arr: DailyMeta[] = [];
  for (let i=0;i<5;i++) {
    const date = new Date();
    date.setDate(date.getDate()-i);
    const ds = date.toISOString().slice(0,10);
    arr.push({ date: ds, sleepQuality: 7, exerciseMinutes: 40, dailyNotes: 'ok', dailyCI: null });
  }
  return arr;
}

describe('statsCalc aggregation', () => {
  const entries = makeEntries();
  const meta = makeMeta();
  const aggregates = buildDayAggregates(entries, meta, settings);

  it('buildDayAggregates returns descending date order', () => {
    expect(aggregates.length).toBe(5);
    for (let i=1;i<aggregates.length;i++) {
      expect(aggregates[i-1].date >= aggregates[i].date).toBe(true);
    }
  });

  it('computeKPIs derives today totals and streak', () => {
    const kpis = computeKPIs(aggregates, meta);
    expect(kpis.todayR).toBeGreaterThan(0);
    expect(kpis.streakDays).toBe(5); // all days have entries filled with daily summary
  });

  it('buildSparkline returns correct span ordered oldest->newest', () => {
    const spark = buildSparkline(aggregates, 'CI', 4);
    expect(spark.length).toBe(4);
    // oldest first: last element is most recent
    expect(spark[0].date <= spark[1].date).toBe(true);
  });

  it('buildBlockAverages returns averages per block', () => {
    const avgs = buildBlockAverages(aggregates, meta, 'R', 5);
    expect(avgs.length).toBeGreaterThan(0);
    const first = avgs[0];
    expect(first).toHaveProperty('blockId');
    expect(first).toHaveProperty('average');
    expect(first).toHaveProperty('trackedDays');
  });
});