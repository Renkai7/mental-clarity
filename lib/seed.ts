import { db } from '@/lib/db';
import type { BlockConfig, Settings, Goals, CIWeights, CIThresholds, CICaps } from '@/types';
import { BlockConfigSchema, SettingsSchema } from '@/types/schemas';

const DEFAULT_BLOCKS: BlockConfig[] = [
  { id: 'block-1', label: 'Wake-9AM', start: '06:00', end: '09:00', order: 0, active: true },
  { id: 'block-2', label: '9AM-12PM', start: '09:00', end: '12:00', order: 1, active: true },
  { id: 'block-3', label: '12PM-3PM', start: '12:00', end: '15:00', order: 2, active: true },
  { id: 'block-4', label: '3PM-6PM', start: '15:00', end: '18:00', order: 3, active: true },
  { id: 'block-5', label: '6PM-9PM', start: '18:00', end: '21:00', order: 4, active: true },
  // Note: keep last block before midnight to satisfy time validation (start < end)
  { id: 'block-6', label: '9PM-11:59PM', start: '21:00', end: '23:59', order: 5, active: true },
];

const DEFAULT_GOALS: Goals = {
  R: 50,
  C: 30,
  A: 20,
  exerciseMinutes: 30,
  minSleepQuality: 7,
};

const DEFAULT_WEIGHTS: CIWeights = {
  alphaR: 0.3,
  alphaC: 0.25,
  alphaA: 0.2,
  alphaAnx: 0.15,
  alphaStr: 0.1,
  betaSleep: 0.05,
  betaEx: 0.05,
};

const DEFAULT_THRESHOLDS: CIThresholds = {
  greenMin: 0.66,
  yellowMin: 0.33,
};

const DEFAULT_CAPS: CICaps = {
  maxR: 50,
  maxC: 30,
  maxA: 20,
};

const SETTINGS_ID = 'singleton';

export async function seedDefaultData(): Promise<void> {
  // Fast path: if settings exist, assume seeded
  const existing = await db.settings.get(SETTINGS_ID);
  if (existing) return;

  // Validate blocks and settings with Zod before inserting
  const validatedBlocks = DEFAULT_BLOCKS.map((b) => BlockConfigSchema.parse(b));

  const settings: Settings = {
    blocks: validatedBlocks,
    goals: DEFAULT_GOALS,
    ciWeights: DEFAULT_WEIGHTS,
    ciThresholds: DEFAULT_THRESHOLDS,
    caps: DEFAULT_CAPS,
    defaultTab: 'R',
    heatmapMetric: 'CI',
  };

  const validatedSettings = SettingsSchema.parse(settings);

  await db.transaction('rw', db.blockConfigs, db.settings, async () => {
    // Insert blocks if table empty
    const blockCount = await db.blockConfigs.count();
    if (blockCount === 0) {
      await db.blockConfigs.bulkPut(validatedBlocks);
    }

    // Insert settings singleton
    await db.settings.put({ id: SETTINGS_ID, ...validatedSettings });
  });
}
