import { useCallback, useEffect, useRef, useState } from 'react';
import { getBlocks, getEntriesForDate, getDailyMeta, upsertEntry, upsertDailyMeta, createEmptyDay, getEntry } from '@/lib/dbUtils';
import type { BlockEntry, DailyMeta, BlockConfig } from '@/types';
import { BlockEntrySchema, DailyMetaSchema, DateString } from '@/types/schemas';
import { makeEntryId } from '@/lib/id';

/**
 * useDayData
 * Loads all entries + daily meta for a given date. Provides helper functions to save
 * per-block entries and the daily meta. Missing block entries can be created lazily.
 *
 * Scope (M9.1): Fetch + explicit save operations. Autosave / CI recalculation handled in later milestones.
 */
export function useDayData(date: string) {
  // Validate date early; throws if invalid (caller should guard try/catch if needed)
  DateString.parse(date);

  const [blocks, setBlocks] = useState<BlockConfig[]>([]);
  const [entries, setEntries] = useState<BlockEntry[]>([]);
  const [dailyMeta, setDailyMeta] = useState<DailyMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const id = ++requestId.current;
    try {
      const [blk, ent, meta] = await Promise.all([
        getBlocks(),
        getEntriesForDate(date),
        getDailyMeta(date),
      ]);
      if (id !== requestId.current) return; // stale
      setBlocks(blk);
      // Ensure entries ordered by block order
      const ordered = ent.slice().sort((a, b) => {
        const ai = blk.findIndex(x => x.id === a.blockId);
        const bi = blk.findIndex(x => x.id === b.blockId);
        return ai - bi;
      });
      setEntries(ordered);
      setDailyMeta(meta ?? null);
    } catch (e: any) {
      if (id === requestId.current) setError(e?.message || 'Failed to load day data');
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Ensure an entry exists for the given blockId for this date; if not, create a zeroed one.
   */
  const ensureEntry = useCallback(async (blockId: string): Promise<BlockEntry> => {
    // Try local first
    const local = entries.find(e => e.blockId === blockId);
    if (local) return local;
    // Try DB in case local stale
    const existing = await getEntry(date, blockId);
    if (existing) {
      setEntries(prev => prev.concat(existing));
      return existing;
    }
    // Create new empty entry object (not persisted until saveEntry invoked)
    const empty: BlockEntry = {
      id: makeEntryId(date, blockId),
      date,
      blockId,
      ruminationCount: 0,
      compulsionsCount: 0,
      avoidanceCount: 0,
      anxietyScore: 5,
      stressScore: 5,
      notes: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEntries(prev => prev.concat(empty));
    return empty;
  }, [date, entries]);

  /**
   * Save (upsert) an entry's modified fields. Only updates fields provided in patch.
   */
  const saveEntry = useCallback(
    async (blockId: string, patch: Partial<Omit<BlockEntry, 'id' | 'date' | 'blockId'>>): Promise<BlockEntry> => {
      try {
        const base = await ensureEntry(blockId);
        const updated: BlockEntry = { ...base, ...patch, updatedAt: new Date().toISOString() };
        BlockEntrySchema.parse(updated);
        await upsertEntry(updated);
        setEntries(prev => prev.map(e => (e.blockId === blockId ? updated : e)));
        return updated;
      } catch (e: any) {
        console.error('[useDayData] saveEntry failed', e);
        throw e;
      }
    },
    [ensureEntry]
  );

  /**
   * Save (upsert) daily meta (sleep quality, exercise minutes, notes). Creates if missing.
   */
  const saveDailyMeta = useCallback(
    async (patch: Partial<Omit<DailyMeta, 'date'>>): Promise<DailyMeta> => {
      try {
        const base: DailyMeta = dailyMeta ?? {
          date,
          sleepQuality: 7,
          exerciseMinutes: 0,
          dailyNotes: undefined,
        };
        const updated: DailyMeta = { ...base, ...patch };
        DailyMetaSchema.parse(updated);
        await upsertDailyMeta(updated);
        setDailyMeta(updated);
        return updated;
      } catch (e: any) {
        console.error('[useDayData] saveDailyMeta failed', e);
        throw e;
      }
    },
    [dailyMeta, date]
  );

  /**
   * Initialize a day by creating empty entries for all active blocks (delegates to backend helper).
   * After creation, reload entries state.
   */
  const initializeDay = useCallback(async () => {
    try {
      await createEmptyDay(date);
      await load();
    } catch (e: any) {
      console.error('[useDayData] initializeDay failed', e);
      setError(e?.message || 'Failed to initialize day');
    }
  }, [date, load]);

  return {
    date,
    blocks,
    entries,
    dailyMeta,
    isLoading,
    error,
    reload: load,
    saveEntry,
    saveDailyMeta,
    initializeDay,
  } as const;
}

export type UseDayDataReturn = ReturnType<typeof useDayData>;