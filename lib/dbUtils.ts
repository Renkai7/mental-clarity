import { db } from '@/lib/db';
import type { Settings, BlockConfig, BlockEntry, DailyMeta } from '@/types';
import {
  SettingsSchema,
  BlockConfigSchema,
  BlockEntrySchema,
  DailyMetaSchema,
  DateString,
} from '@/types/schemas';

const SETTINGS_ID = 'singleton';

export async function getSettings(): Promise<Settings> {
  const row = await db.settings.get(SETTINGS_ID);
  if (!row) throw new Error('Settings not found. Ensure seeding ran.');
  // Basic validation before returning
  return SettingsSchema.parse(row as Settings);
}

export async function updateSettings(settings: Settings): Promise<void> {
  const validated = SettingsSchema.parse(settings);

  await db.transaction('rw', db.blockConfigs, db.settings, async () => {
    // Sync blockConfigs table to provided blocks for consistency
    await db.blockConfigs.clear();
    const validatedBlocks = validated.blocks.map((b) => BlockConfigSchema.parse(b));
    if (validatedBlocks.length) {
      await db.blockConfigs.bulkPut(validatedBlocks);
    }
    await db.settings.put({ id: SETTINGS_ID, ...validated });
  });
}

export async function getBlocks(): Promise<BlockConfig[]> {
  const blocks = await db.blockConfigs.orderBy('order').toArray();
  return blocks.map((b) => BlockConfigSchema.parse(b));
}

export async function getEntriesForDate(date: string): Promise<BlockEntry[]> {
  DateString.parse(date);
  const entries = await db.entries.where('date').equals(date).toArray();
  // Stable order by blockId for deterministic UI
  entries.sort((a, b) => a.blockId.localeCompare(b.blockId));
  return entries.map((e) => BlockEntrySchema.parse(e));
}

export async function getDailyMeta(date: string): Promise<DailyMeta | undefined> {
  DateString.parse(date);
  const meta = await db.dailyMeta.get(date);
  if (!meta) return undefined;
  return DailyMetaSchema.parse(meta);
}

export async function upsertEntry(entry: BlockEntry): Promise<void> {
  const now = new Date().toISOString();
  const existing = await db.entries.get(entry.id);
  const toSave: BlockEntry = {
    ...entry,
    createdAt: existing?.createdAt ?? entry.createdAt ?? now,
    updatedAt: now,
  };
  BlockEntrySchema.parse(toSave);
  await db.entries.put(toSave);
}

export async function upsertDailyMeta(meta: DailyMeta): Promise<void> {
  const validated = DailyMetaSchema.parse(meta);
  await db.dailyMeta.put(validated);
}
