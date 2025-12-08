"use client";

import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import DailySummary from "./DailySummary";
import TimeframeGrid, { TimeframeEntry } from "./TimeframeGrid";
import DailyTotals from "./DailyTotals";
import { useDayData } from "../hooks/useDayData";

interface DayDetailFormProps {
  date: string;
}

export default function DayDetailForm({ date }: DayDetailFormProps) {
  const {
    blocks,
    entries: rawEntries,
    dailyMeta,
    isLoading,
    error,
    saveEntry,
    saveDailyMeta,
    initializeDay,
  } = useDayData(date);

  // Derive timeframe-friendly entry objects (ensure stable ordering via blocks)
  // Draft overrides hold unsaved edits until debounced flush.
  const [draftOverrides, setDraftOverrides] = useState<Record<string, TimeframeEntry>>({});
  const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const pendingBlocksRef = useRef<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  // Daily meta draft + debounce (M9.4)
  const [dailyMetaDraft, setDailyMetaDraft] = useState<{ sleepQuality: number; exerciseMinutes: number; dailyNotes: string }>({
    sleepQuality: dailyMeta?.sleepQuality ?? 7,
    exerciseMinutes: dailyMeta?.exerciseMinutes ?? 0,
    dailyNotes: dailyMeta?.dailyNotes ?? '',
  });
  const metaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const metaPendingRef = useRef<boolean>(false);

  // Keep draft in sync when underlying persisted meta changes (e.g., after reload)
  useEffect(() => {
    if (dailyMeta) {
      setDailyMetaDraft({
        sleepQuality: dailyMeta.sleepQuality ?? 7,
        exerciseMinutes: dailyMeta.exerciseMinutes ?? 0,
        dailyNotes: dailyMeta.dailyNotes ?? '',
      });
    }
  }, [dailyMeta]);

  const timeframeEntries: TimeframeEntry[] = useMemo(() => {
    return blocks.map((blk) => {
      const override = draftOverrides[blk.id];
      if (override) return override;
      const entry = rawEntries.find((e) => e.blockId === blk.id);
      return {
        blockLabel: blk.label,
        rumination: entry?.ruminationCount ?? 0,
        compulsions: entry?.compulsionsCount ?? 0,
        avoidance: entry?.avoidanceCount ?? 0,
        anxiety: entry?.anxietyScore ?? 5,
        stress: entry?.stressScore ?? 5,
        notes: entry?.notes ?? "",
      };
    });
  }, [blocks, rawEntries, draftOverrides]);

  // Compute daily totals from derived entries
  const totals = useMemo(() => {
    return timeframeEntries.reduce(
      (acc, entry) => ({
        rumination: acc.rumination + entry.rumination,
        compulsions: acc.compulsions + entry.compulsions,
        avoidance: acc.avoidance + entry.avoidance,
      }),
      { rumination: 0, compulsions: 0, avoidance: 0 }
    );
  }, [timeframeEntries]);

  // Persist changes directly (M9.2 simple wiring; autosave/debounce in M9.3)
  // Debounced autosave (M9.3): queue save after inactivity.
  const flushBlockSave = useCallback(async (blockId: string) => {
    const blk = blocks.find(b => b.id === blockId);
    const draft = draftOverrides[blockId];
    if (!blk || !draft) return;
    setIsSaving(true);
    try {
      await saveEntry(blockId, {
        ruminationCount: draft.rumination,
        compulsionsCount: draft.compulsions,
        avoidanceCount: draft.avoidance,
        anxietyScore: draft.anxiety,
        stressScore: draft.stress,
        notes: draft.notes || undefined,
      });
      // Remove override after persistence so fresh data displays from rawEntries
      setDraftOverrides(prev => {
        const c = { ...prev };
        delete c[blockId];
        return c;
      });
      pendingBlocksRef.current.delete(blockId);
    } catch (e) {
      console.error('[day] autosave failed', e);
      // Keep override so user doesn't lose edits; could mark error later.
    } finally {
      // If no more pending blocks, clear saving state shortly (allow UI to show completion)
      if (pendingBlocksRef.current.size === 0) {
        setTimeout(() => setIsSaving(false), 120);
      }
    }
  }, [blocks, draftOverrides, saveEntry]);

  const handleEntryChange = (index: number, updated: TimeframeEntry) => {
    const blk = blocks[index];
    if (!blk) return;
    setDraftOverrides(prev => ({ ...prev, [blk.id]: updated }));
    pendingBlocksRef.current.add(blk.id);
    // Clear previous timeout
    const existing = saveTimeouts.current[blk.id];
    if (existing) clearTimeout(existing);
    // Schedule new save
    saveTimeouts.current[blk.id] = setTimeout(() => {
      flushBlockSave(blk.id);
    }, 600); // 600ms debounce window
  };

  // Flush daily meta draft
  const flushDailyMeta = useCallback(async () => {
    if (!metaPendingRef.current) return;
    setIsSaving(true);
    try {
      await saveDailyMeta({
        sleepQuality: dailyMetaDraft.sleepQuality,
        exerciseMinutes: dailyMetaDraft.exerciseMinutes,
        dailyNotes: dailyMetaDraft.dailyNotes || undefined,
      });
      // Placeholder: CI recalculation trigger (M10) would go here.
    } catch (e) {
      console.error('[day] daily meta autosave failed', e);
    } finally {
      metaPendingRef.current = false;
      if (pendingBlocksRef.current.size === 0 && !metaPendingRef.current) {
        setTimeout(() => setIsSaving(false), 120);
      }
    }
  }, [dailyMetaDraft, saveDailyMeta]);

  const scheduleMetaSave = useCallback(() => {
    if (metaTimeoutRef.current) clearTimeout(metaTimeoutRef.current);
    metaPendingRef.current = true;
    metaTimeoutRef.current = setTimeout(() => {
      flushDailyMeta();
    }, 700); // 700ms debounce for daily meta
  }, [flushDailyMeta]);

  const handleSleepChange = (v: number) => {
    setDailyMetaDraft(d => ({ ...d, sleepQuality: v }));
    scheduleMetaSave();
  };
  const handleExerciseChange = (v: number) => {
    setDailyMetaDraft(d => ({ ...d, exerciseMinutes: v }));
    scheduleMetaSave();
  };
  const handleNotesChange = (v: string) => {
    setDailyMetaDraft(d => ({ ...d, dailyNotes: v }));
    scheduleMetaSave();
  };

  return (
    <div className="relative pb-24">
      {isLoading && (
        <div className="mb-4 text-sm text-slate-400" role="status">
          Loading day data...
        </div>
      )}
      {!isLoading && !error && (
        <div className="mb-4 text-xs font-medium text-slate-400" aria-live="polite">
          {isSaving || pendingBlocksRef.current.size > 0 || metaPendingRef.current ? 'Autosave pending…' : 'All changes saved'}
        </div>
      )}
      {error && !isLoading && (
        <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}
      {/* Daily Summary Section */}
      <section
        aria-labelledby="daily-summary"
        className="mb-8 rounded-md border border-cinematic-800 bg-cinematic-950/40 p-4 backdrop-blur-sm"
      >
        <h2
          id="daily-summary"
          className="mb-3 text-lg font-medium text-white"
        >
          Daily Summary
        </h2>
        <DailySummary
          date={date}
          sleepQuality={dailyMeta?.sleepQuality}
          exerciseMinutes={dailyMeta?.exerciseMinutes}
          notes={dailyMeta?.dailyNotes}
          onSleepQualityChange={handleSleepChange}
          onExerciseMinutesChange={handleExerciseChange}
          onNotesChange={handleNotesChange}
        />
      </section>

      {/* Timeframes Section */}
      <section
        aria-labelledby="timeframe-grid"
        className="rounded-md border border-cinematic-800 bg-cinematic-950/40 p-4 backdrop-blur-sm"
      >
        <h2
          id="timeframe-grid"
          className="mb-3 text-lg font-medium text-white"
        >
          Timeframes
        </h2>
        {blocks.length === 0 && !isLoading ? (
          <div className="text-sm text-slate-400">
            No active blocks configured. Add blocks in Settings.
          </div>
        ) : timeframeEntries.every((e) => e.rumination === 0 && e.compulsions === 0 && e.avoidance === 0 && rawEntries.length === 0) && !isLoading ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-400">
              This day has no entries yet. Initialize to create empty rows.
            </p>
            <button
              type="button"
              onClick={initializeDay}
              className="w-fit rounded-md border border-cinematic-800 bg-cinematic-900/60 px-3 py-1 text-sm font-medium text-white hover:bg-lumina-orange-500/20 hover:border-lumina-orange-500/30 hover:shadow-glow-orange-sm transition-all"
            >
              Initialize Day
            </button>
          </div>
        ) : (
          <TimeframeGrid
            entries={timeframeEntries}
            onEntryChange={handleEntryChange}
          />
        )}
      </section>

      {/* Sticky Daily Totals */}
      <DailyTotals
        ruminationTotal={totals.rumination}
        compulsionsTotal={totals.compulsions}
        avoidanceTotal={totals.avoidance}
      />
    </div>
  );
}
