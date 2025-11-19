import { db } from '@/lib/db';
import { makeEntryId } from '@/lib/id';
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

export async function getEntry(date: string, blockId: string): Promise<BlockEntry | undefined> {
  DateString.parse(date);
  const found = await db.entries.where('[date+blockId]').equals([date, blockId]).first();
  if (!found) return undefined;
  return BlockEntrySchema.parse(found);
}

// Create empty entries for all active blocks for the given date.
// Idempotent: existing entries are preserved; missing ones are created with zeros.
export async function createEmptyDay(date: string): Promise<void> {
  const blocks = await getBlocks();
  const activeBlocks = blocks.filter(b => b.active);
  const nowISO = new Date().toISOString();

  for (const b of activeBlocks) {
    const existing = await getEntry(date, b.id);
    if (existing) continue;

    const entry: BlockEntry = {
      id: makeEntryId(date, b.id),
      date,
      blockId: b.id,
      ruminationCount: 0,
      compulsionsCount: 0,
      avoidanceCount: 0,
      anxietyScore: 5,
      stressScore: 5,
      notes: undefined,
      createdAt: nowISO,
      updatedAt: nowISO,
    } as BlockEntry;
    await upsertEntry(entry);
  }
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
