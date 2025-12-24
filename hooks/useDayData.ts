import { useCallback, useEffect, useRef, useState } from 'react';
import { getBlocks, getEntriesForDate, getDailyMeta, upsertEntry, upsertDailyMeta, createEmptyDay, getEntry, getSettings } from '@/lib/dbUtils';
import { computeBlockCI, computeDailyCI } from '@/lib/clarity';
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
    console.log('[useDayData] load called for date:', date);
    setIsLoading(true);
    setError(null);
    const id = ++requestId.current;
    try {
      const [blk, ent, meta] = await Promise.all([
        getBlocks(),
        getEntriesForDate(date),
        getDailyMeta(date),
      ]);  
      console.log('[useDayData] loaded data for date:', date, 'meta:', meta);
      if (id !== requestId.current) return; // stale
      setBlocks(blk);
      // Ensure entries ordered by block order
      const ordered = ent.slice().sort((a: BlockEntry, b: BlockEntry) => {
        const ai = blk.findIndex((x: BlockConfig) => x.id === a.blockId);
        const bi = blk.findIndex((x: BlockConfig) => x.id === b.blockId);
        return ai - bi;
      });
      setEntries(ordered);
      setDailyMeta(meta ?? null);
    } catch (e) {
      if (id === requestId.current) setError(e instanceof Error ? e.message : 'Failed to load day data');
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
        // Recompute daily CI after block entry change if meta exists
        if (dailyMeta) {
          try {
            const settings = await getSettings();
            const blockCIs = entries
              .map(e => e.blockId === blockId ? updated : e)
              .map(e => computeBlockCI(e, settings.ciWeights, settings.caps));
            const dailyCI = computeDailyCI(blockCIs, { ...dailyMeta }, settings.ciWeights, settings.goals);
            const newMeta: DailyMeta = { ...dailyMeta, dailyCI };
            await upsertDailyMeta(newMeta);
            setDailyMeta(newMeta);
          } catch (err) {
            console.warn('[useDayData] dailyCI recompute failed', err);
          }
        }
        return updated;
      } catch (e) {
        console.error('[useDayData] saveEntry failed', e);
        throw e;
      }
    },
    [ensureEntry, dailyMeta, entries]
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
          dailyCI: null,
          tracked: false,
        };
        const provisional: DailyMeta = { ...base, ...patch };
        // Compute CI if we have entries
        let dailyCI: number | null = null;
        try {
          const settings = await getSettings();
          if (entries.length > 0) {
            const blockCIs = entries.map(e => computeBlockCI(e, settings.ciWeights, settings.caps));
            dailyCI = computeDailyCI(blockCIs, provisional, settings.ciWeights, settings.goals);
          }
        } catch (err) {
          console.warn('[useDayData] dailyCI compute during meta save failed', err);
        }
        const updated: DailyMeta = { ...provisional, dailyCI };
        DailyMetaSchema.parse(updated);
        await upsertDailyMeta(updated);
        setDailyMeta(updated);
        return updated;
      } catch (e) {
        console.error('[useDayData] saveDailyMeta failed', e);
        throw e;
      }
    },
    [dailyMeta, date, entries]
  );

  /**
   * Initialize a day by creating empty entries for all active blocks (delegates to backend helper).
   * After creation, reload entries state.
   */
  const initializeDay = useCallback(async () => {
    try {
      await createEmptyDay(date);
      await load();
    } catch (e) {
      console.error('[useDayData] initializeDay failed', e);
      setError(e instanceof Error ? e.message : 'Failed to initialize day');
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