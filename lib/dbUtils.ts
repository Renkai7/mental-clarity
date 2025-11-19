import type { Settings, BlockConfig, BlockEntry, DailyMeta } from '@/types';
import {
  SettingsSchema,
  BlockConfigSchema,
  BlockEntrySchema,
  DailyMetaSchema,
  DateString,
} from '@/types/schemas';
import * as api from '@/lib/dataClient';
import { db } from '@/lib/db';
import type { BlockEntry as _BE } from '@/types';

export async function getSettings(): Promise<Settings> {
  try {
    if (typeof window !== 'undefined' && (window as any).api) {
      const row = await api.getSettings();
      if (!row) throw new Error('Settings not found. Ensure seeding ran.');
      return SettingsSchema.parse(row as Settings);
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[dbUtils] Falling back to Dexie getSettings() after IPC error');
    }
  }
  // Fallback to Dexie (dev/browser)
  const SETTINGS_ID = 'singleton';
  const row = await db.settings.get(SETTINGS_ID);
  if (!row) throw new Error('Settings not found. Ensure seeding ran.');
  return SettingsSchema.parse(row as any);
}

export async function updateSettings(settings: Settings): Promise<void> {
  const validated = SettingsSchema.parse(settings);
  // Update settings JSON and sync block_configs in SQLite
  const validatedBlocks = validated.blocks.map((b) => BlockConfigSchema.parse(b));
  try {
    if (typeof window !== 'undefined' && (window as any).api) {
      await api.updateSettings(validated);
      if (validatedBlocks.length && (window as any).api?.replaceBlocks) {
        await (window as any).api.replaceBlocks(validatedBlocks);
      }
      return;
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[dbUtils] Falling back to Dexie updateSettings() after IPC error');
    }
  }
  // Fallback: mirror old Dexie behavior so UI continues to work in dev
  await db.transaction('rw', db.blockConfigs, db.settings, async () => {
    await db.blockConfigs.clear();
    if (validatedBlocks.length) {
      await db.blockConfigs.bulkPut(validatedBlocks as any);
    }
    const SETTINGS_ID = 'singleton';
    await db.settings.put({ id: SETTINGS_ID, ...(validated as any) });
  });
}

export async function getBlocks(): Promise<BlockConfig[]> {
  // Prefer Electron IPC; gracefully fallback to Dexie in dev/browser
  if (typeof window !== 'undefined' && (window as any).api) {
    const blocks = await api.getBlocks();
    return blocks.map((b: any) => BlockConfigSchema.parse(b));
  }
  const blocks = await db.blockConfigs.orderBy('order').toArray();
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[dbUtils] Falling back to Dexie getBlocks()');
  }
  return blocks.map((b) => BlockConfigSchema.parse(b as any));
}

export async function getEntriesForDate(date: string): Promise<BlockEntry[]> {
  DateString.parse(date);
  if (typeof window !== 'undefined' && (window as any).api) {
    const entries = await api.getEntriesForDate(date);
    entries.sort((a: any, b: any) => a.blockId.localeCompare(b.blockId));
    return entries.map((e: any) => BlockEntrySchema.parse(e));
  }
  const entries = await db.entries.where('date').equals(date).toArray();
  entries.sort((a, b) => a.blockId.localeCompare(b.blockId));
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[dbUtils] Falling back to Dexie getEntriesForDate()');
  }
  return entries.map((e) => BlockEntrySchema.parse(e as any));
}

export async function getDailyMeta(date: string): Promise<DailyMeta | undefined> {
  DateString.parse(date);
  if (typeof window !== 'undefined' && (window as any).api) {
    const meta = await api.getDailyMeta(date);
    if (!meta) return undefined;
    return DailyMetaSchema.parse(meta);
  }
  const meta = await db.dailyMeta.get(date);
  if (!meta) return undefined;
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[dbUtils] Falling back to Dexie getDailyMeta()');
  }
  return DailyMetaSchema.parse(meta as any);
}

export async function getEntry(date: string, blockId: string): Promise<BlockEntry | undefined> {
  DateString.parse(date);
  if (typeof window !== 'undefined' && (window as any).api?.getEntry) {
    const found = await (window as any).api.getEntry(date, blockId);
    if (!found) return undefined;
    return BlockEntrySchema.parse(found);
  }
  const found = await db.entries.where('[date+blockId]').equals([date, blockId]).first();
  if (!found) return undefined;
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[dbUtils] Falling back to Dexie getEntry()');
  }
  return BlockEntrySchema.parse(found as any);
}

// Create empty entries for all active blocks for the given date.
// Idempotent: existing entries are preserved; missing ones are created with zeros.
export async function createEmptyDay(date: string): Promise<void> {
  // Prefer main process; fallback to Dexie for dev/browser
  if (typeof window !== 'undefined' && (window as any).api) {
    await api.createEmptyDay(date);
    return;
  }
  const blocks = await getBlocks();
  const activeBlocks = blocks.filter(b => b.active);
  const nowISO = new Date().toISOString();
  for (const b of activeBlocks) {
    const existing = await getEntry(date, b.id);
    if (existing) continue;
    const entry: BlockEntry = {
      id: `${date}:${b.id}`,
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
    } as any;
    await upsertEntry(entry);
  }
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
  if (typeof window !== 'undefined' && (window as any).api) {
    await api.upsertEntry(toSave);
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[dbUtils] Falling back to Dexie upsertEntry()');
    }
    await db.entries.put(toSave as any);
  }
}

export async function upsertDailyMeta(meta: DailyMeta): Promise<void> {
  const validated = DailyMetaSchema.parse(meta);
  if (typeof window !== 'undefined' && (window as any).api) {
    await api.upsertDailyMeta(validated);
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[dbUtils] Falling back to Dexie upsertDailyMeta()');
    }
    await db.dailyMeta.put(validated as any);
  }
}

// Summary for main grid: latest N dates aggregated by metric
export type Metric = 'R' | 'C' | 'A';
export async function getMainGridSummary(metric: Metric, limit: number) {
  if (typeof window !== 'undefined' && (window as any).api?.getEntriesSummary) {
    return api.getEntriesSummary(metric, limit);
  }
  // Dexie fallback mirrors prior client aggregation
  const field: keyof _BE = metric === 'R' ? 'ruminationCount' : metric === 'C' ? 'compulsionsCount' : 'avoidanceCount';
  const entries = await db.entries.orderBy('date').reverse().toArray();
  const byDate: Map<string, Map<string, number>> = new Map();
  for (const e of entries) {
    const d = (e as any).date as string;
    let blocks = byDate.get(d);
    if (!blocks) {
      blocks = new Map();
      byDate.set(d, blocks);
    }
    const current = blocks.get((e as any).blockId) ?? 0;
    const inc = (e as any)[field] as number;
    blocks.set((e as any).blockId, current + (typeof inc === 'number' ? inc : 0));
  }
  const sortedDates = Array.from(byDate.keys()).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  const limitedDates = sortedDates.slice(0, Number(limit || 30));
  const rows = limitedDates.map((d) => {
    const blocks = byDate.get(d)!;
    const timeframes: Record<string, number> = {};
    let total = 0;
    for (const [blockId, count] of blocks.entries()) {
      timeframes[blockId] = count;
      total += count;
    }
    return { date: d, total, timeframes };
  });
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[dbUtils] Falling back to Dexie getMainGridSummary()');
  }
  return rows;
}
