import { z } from 'zod';
import { parseISO, isValid } from 'date-fns';

// Reusable regex patterns
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm 24h
const ISO_TS_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?Z$/; // Basic ISO UTC

// Primitive validators
export const DateString = z.string().regex(DATE_REGEX, 'Invalid date format (expected YYYY-MM-DD)')
  .refine(d => isValid(parseISO(d)), 'Invalid calendar date');
export const TimeString = z.string().regex(TIME_REGEX, 'Invalid time format (expected HH:mm 24h)');
export const IsoTimestamp = z.string().regex(ISO_TS_REGEX, 'Invalid ISO timestamp (expected UTC Z suffix)');

export const NonNegativeInt = z.number().int().min(0);
export const Score1to10 = z.number().int().min(1).max(10);

// Metrics enums
export const MetricEnum = z.enum(['R','C','A']);
export const HeatmapMetricEnum = z.enum(['CI','R','C','A']);

// BlockConfig schema
export const BlockConfigSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, 'Label required'),
  start: TimeString,
  end: TimeString,
  order: z.number().int().min(0),
  active: z.boolean(),
}).refine(v => v.start < v.end, {
  message: 'End time must be after start time',
  path: ['end']
});

// BlockEntry schema
export const BlockEntrySchema = z.object({
  id: z.string().min(1),
  date: DateString,
  blockId: z.string().min(1),
  ruminationCount: NonNegativeInt,
  compulsionsCount: NonNegativeInt,
  avoidanceCount: NonNegativeInt,
  anxietyScore: Score1to10,
  stressScore: Score1to10,
  notes: z.string().max(500).optional(),
  createdAt: IsoTimestamp,
  updatedAt: IsoTimestamp,
});

// DailyMeta schema
export const DailyMetaSchema = z.object({
  date: DateString,
  sleepQuality: Score1to10,
  exerciseMinutes: NonNegativeInt,
  dailyNotes: z.string().max(1000).optional(),
});

// Goals schema
export const GoalsSchema = z.object({
  R: NonNegativeInt,
  C: NonNegativeInt,
  A: NonNegativeInt,
  exerciseMinutes: NonNegativeInt,
  minSleepQuality: Score1to10,
});

// CI related schemas
export const CICapsSchema = z.object({
  maxR: NonNegativeInt.min(1),
  maxC: NonNegativeInt.min(1),
  maxA: NonNegativeInt.min(1),
});

export const CIWeightsSchema = z.object({
  alphaR: z.number().min(0).max(1),
  alphaC: z.number().min(0).max(1),
  alphaA: z.number().min(0).max(1),
  alphaAnx: z.number().min(0).max(1),
  alphaStr: z.number().min(0).max(1),
  betaSleep: z.number().min(0).max(1),
  betaEx: z.number().min(0).max(1),
}).refine(w => {
  const sum = w.alphaR + w.alphaC + w.alphaA + w.alphaAnx + w.alphaStr;
  return sum <= 1.00001; // allow tiny float tolerance
}, { message: 'Sum of alpha weights must be <= 1.0' });

export const CIThresholdsSchema = z.object({
  greenMin: z.number().min(0).max(1),
  yellowMin: z.number().min(0).max(1),
}).refine(t => t.greenMin >= t.yellowMin, {
  message: 'greenMin must be >= yellowMin',
  path: ['greenMin']
});

// Settings schema
export const SettingsSchema = z.object({
  blocks: z.array(BlockConfigSchema),
  goals: GoalsSchema,
  ciWeights: CIWeightsSchema,
  ciThresholds: CIThresholdsSchema,
  caps: CICapsSchema,
  defaultTab: MetricEnum,
  heatmapMetric: HeatmapMetricEnum,
});

// Export inferred types
export type BlockConfig = z.infer<typeof BlockConfigSchema>;
export type BlockEntry = z.infer<typeof BlockEntrySchema>;
export type DailyMeta = z.infer<typeof DailyMetaSchema>;
export type Goals = z.infer<typeof GoalsSchema>;
export type CICaps = z.infer<typeof CICapsSchema>;
export type CIWeights = z.infer<typeof CIWeightsSchema>;
export type CIThresholds = z.infer<typeof CIThresholdsSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

// Helper validation functions (optional convenience)
export const validateBlockEntry = (data: unknown) => BlockEntrySchema.parse(data);
export const validateSettings = (data: unknown) => SettingsSchema.parse(data);
export const safeParseSettings = (data: unknown) => SettingsSchema.safeParse(data);
