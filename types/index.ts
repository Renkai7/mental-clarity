// Core domain TypeScript interfaces for data layer (M7.2)

export type Metric = 'R' | 'C' | 'A';
export type HeatmapMetric = 'CI' | Metric;

export interface BlockConfig {
  id: string;
  label: string;
  start: string; // HH:mm
  end: string;   // HH:mm
  order: number;
  active: boolean;
}

export interface BlockEntry {
  id: string;
  date: string; // YYYY-MM-DD
  blockId: string;
  ruminationCount: number;
  compulsionsCount: number;
  avoidanceCount: number;
  anxietyScore: number; // 1-10
  stressScore: number;  // 1-10
  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface DailyMeta {
  date: string; // YYYY-MM-DD
  sleepQuality: number; // 1-10
  exerciseMinutes: number;
  dailyNotes?: string;
  dailyCI?: number | null; // persisted clarity index (0..1) null if not yet computed
}

export interface Goals {
  R: number; // max rumination target
  C: number; // max compulsions target
  A: number; // max avoidance target
  exerciseMinutes: number; // minimum exercise target
  minSleepQuality: number; // minimum sleep quality target (1-10)
}

export interface CICaps {
  maxR: number;
  maxC: number;
  maxA: number;
}

export interface CIWeights {
  alphaR: number;
  alphaC: number;
  alphaA: number;
  alphaAnx: number;
  alphaStr: number;
  betaSleep: number;
  betaEx: number;
}

export interface CIThresholds {
  greenMin: number; // >= greenMin → green
  yellowMin: number; // >= yellowMin → yellow, else red
}

export interface Settings {
  blocks: BlockConfig[];
  goals: Goals;
  ciWeights: CIWeights;
  ciThresholds: CIThresholds;
  caps: CICaps;
  defaultTab: Metric;
  heatmapMetric: HeatmapMetric;
}
