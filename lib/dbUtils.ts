import type { Settings, BlockConfig, BlockEntry, DailyMeta } from '@/types';
import {
  SettingsSchema,
  BlockConfigSchema,
  BlockEntrySchema,
  DailyMetaSchema,
  DateString,
} from '@/types/schemas';
import * as api from '@/lib/dataClient';
import type { BlockEntry as _BE } from '@/types';

export async function getSettings(): Promise<Settings> {
  const row = await api.getSettings();
  if (!row) throw new Error('Settings not found. Ensure seeding ran.');
  return SettingsSchema.parse(row as Settings);
}

export async function updateSettings(settings: Settings): Promise<void> {
  const validated = SettingsSchema.parse(settings);
  // Update settings JSON and sync block_configs in SQLite
  const validatedBlocks = validated.blocks.map((b) => BlockConfigSchema.parse(b));
  await api.updateSettings(validated);
  if (validatedBlocks.length && (window as any).api?.replaceBlocks) {
    await (window as any).api.replaceBlocks(validatedBlocks);
  }
}

export async function getBlocks(): Promise<BlockConfig[]> {
  const blocks = await api.getBlocks();
  return blocks.map((b: any) => BlockConfigSchema.parse(b));
}

export async function getEntriesForDate(date: string): Promise<BlockEntry[]> {
  DateString.parse(date);
  const entries: any[] = await api.getEntriesForDate(date);
  entries.sort((a: any, b: any) => a.blockId.localeCompare(b.blockId));
  return entries.map((e: any) => BlockEntrySchema.parse(e));
}

export async function getDailyMeta(date: string): Promise<DailyMeta | undefined> {
  DateString.parse(date);
  const meta = await api.getDailyMeta(date);
  if (!meta) return undefined;
  return DailyMetaSchema.parse(meta);
}

export async function getEntry(date: string, blockId: string): Promise<BlockEntry | undefined> {
  DateString.parse(date);
  const found = await (window as any).api.getEntry(date, blockId);
  if (!found) return undefined;
  return BlockEntrySchema.parse(found);
}

// Create empty entries for all active blocks for the given date.
// Idempotent: existing entries are preserved; missing ones are created with zeros.
export async function createEmptyDay(date: string): Promise<void> {
  await api.createEmptyDay(date);
}

export async function upsertEntry(entry: BlockEntry): Promise<void> {
  const now = new Date().toISOString();
  const toSave: BlockEntry = {
    ...entry,
    createdAt: entry.createdAt ?? now,
    updatedAt: now,
  };
  try {
    // Ensure scores meet schema (some legacy rows had 0)
    if ((toSave as any).anxietyScore < 1) (toSave as any).anxietyScore = 5;
    if ((toSave as any).stressScore < 1) (toSave as any).stressScore = 5;
    BlockEntrySchema.parse(toSave);
  } catch (e: any) {
    console.error('[dbUtils] BlockEntry validation failed', e?.issues || e?.message || e);
    throw e;
  }
  await api.upsertEntry(toSave);
}

export async function upsertDailyMeta(meta: DailyMeta): Promise<void> {
  const validated = DailyMetaSchema.parse(meta);
  await api.upsertDailyMeta(validated);
}

// Summary for main grid: latest N dates aggregated by metric
export type Metric = 'R' | 'C' | 'A';
export async function getMainGridSummary(metric: Metric, limit: number) {
  return api.getEntriesSummary(metric, limit);
}
