import type { BlockEntry, DailyMeta, CIWeights, CICaps, CIThresholds, Goals } from '@/types';

// Normalization helpers
export function normalizeCount(value: number, cap: number): number {
  if (cap <= 0) return 0;
  const v = Math.max(0, value);
  return Math.min(1, v / cap);
}

export function normalizeScore(value: number): number {
  // Scores are 1..10 → map to 0..1
  const v = Math.max(1, Math.min(10, value));
  return (v - 1) / 9; // 1→0, 10→1 (linear)
}

export function normalizeSleep(sleepQuality: number): number {
  // Sleep quality 1..10; direct mapping to 0..1 using (value-1)/9 keeps symmetry
  return normalizeScore(sleepQuality);
}

export function normalizeExercise(exMinutes: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(1, Math.max(0, exMinutes / target));
}

export interface BlockCIInput {
  entry: Pick<BlockEntry, 'ruminationCount' | 'compulsionsCount' | 'avoidanceCount' | 'anxietyScore' | 'stressScore'>;
}

export function computeBlockCI(entry: BlockCIInput['entry'], weights: CIWeights, caps: CICaps): number {
  const r = normalizeCount(entry.ruminationCount, caps.maxR);
  const c = normalizeCount(entry.compulsionsCount, caps.maxC);
  const a = normalizeCount(entry.avoidanceCount, caps.maxA);
  const anx = normalizeScore(entry.anxietyScore);
  const str = normalizeScore(entry.stressScore);

  const sum = (
    weights.alphaR * r +
    weights.alphaC * c +
    weights.alphaA * a +
    weights.alphaAnx * anx +
    weights.alphaStr * str
  );
  const ci = 1 - sum; // higher is better
  return clamp01(ci);
}

export function computeDailyCI(blockCIs: number[], meta: DailyMeta, weights: CIWeights, goals: Goals): number {
  if (blockCIs.length === 0) return 0;
  const meanBlocks = blockCIs.reduce((acc, v) => acc + v, 0) / blockCIs.length;
  const sleep = normalizeSleep(meta.sleepQuality);
  const ex = normalizeExercise(meta.exerciseMinutes, goals.exerciseMinutes);
  const ci = meanBlocks + weights.betaSleep * sleep + weights.betaEx * ex;
  return clamp01(ci);
}

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function mapCIToColor(ci: number, thresholds: CIThresholds): 'green' | 'yellow' | 'red' {
  if (ci >= thresholds.greenMin) return 'green';
  if (ci >= thresholds.yellowMin) return 'yellow';
  return 'red';
}

export function mapCountToColor(count: number, cap: number, thresholds: CIThresholds): 'green' | 'yellow' | 'red' {
  const ratio = cap > 0 ? Math.min(1, Math.max(0, count / cap)) : 0;
  // Lower ratio is better
  if (ratio <= (1 - thresholds.greenMin)) return 'green';
  if (ratio <= (1 - thresholds.yellowMin)) return 'yellow';
  return 'red';
}

// Aggregate convenience wrapper for a day (without persistence side-effects)
export interface DailyCIContext {
  entries: BlockEntry[];
  meta: DailyMeta | null;
  weights: CIWeights;
  caps: CICaps;
  goals: Goals;
}

export function computeDayCIContext(ctx: DailyCIContext): { blockCIs: Record<string, number>; dailyCI: number | null } {
  const blockCIs: Record<string, number> = {};
  for (const e of ctx.entries) {
    blockCIs[e.blockId] = computeBlockCI(e, ctx.weights, ctx.caps);
  }
  const dailyCI = ctx.meta ? computeDailyCI(Object.values(blockCIs), ctx.meta, ctx.weights, ctx.goals) : null;
  return { blockCIs, dailyCI };
}

// Placeholder: future persistence: attach CI to daily_meta once migration adds column.
export const CLARITY_VERSION = 1;