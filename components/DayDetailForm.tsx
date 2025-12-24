"use client";

import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import DailySummary from "./DailySummary";
import TimeframeGrid, { TimeframeEntry } from "./TimeframeGrid";
import DailyTotals from "./DailyTotals";
import { useDayData } from "../hooks/useDayData";
import { isTrackedDay } from "@/lib/statsCalc";

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
    reload,
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

  // Check if this day is tracked
  const dayIsTracked = useMemo(() => {
    return isTrackedDay(dailyMeta);
  }, [dailyMeta]);

  // Persist changes directly (M9.2 simple wiring; autosave/debounce in M9.3)
  // Debounced autosave (M9.3): queue save after inactivity.
  const flushBlockSave = useCallback(async (blockId: string, entry: TimeframeEntry) => {
    const blk = blocks.find(b => b.id === blockId);
    if (!blk) return;
    
    setIsSaving(true);
    pendingBlocksRef.current.add(blockId);
    
    try {
      await saveEntry(blockId, {
        ruminationCount: entry.rumination,
        compulsionsCount: entry.compulsions,
        avoidanceCount: entry.avoidance,
        anxietyScore: entry.anxiety,
        stressScore: entry.stress,
        notes: entry.notes || undefined,
      });
      
      // Remove override after persistence so fresh data displays from rawEntries
      setDraftOverrides(prev => {
        const c = { ...prev };
        delete c[blockId];
        return c;
      });
      
      pendingBlocksRef.current.delete(blockId);
      
      // If no more pending blocks or meta, clear saving state
      if (pendingBlocksRef.current.size === 0 && !metaPendingRef.current) {
        setTimeout(() => setIsSaving(false), 120);
      }
    } catch (e) {
      console.error('[day] autosave failed', e);
      pendingBlocksRef.current.delete(blockId);
      // Keep override so user doesn't lose edits
    }
  }, [blocks, saveEntry]);

  const handleEntryChange = (index: number, updated: TimeframeEntry) => {
    const blk = blocks[index];
    if (!blk) return;
    
    // Update draft immediately for UI responsiveness
    setDraftOverrides(prev => ({ ...prev, [blk.id]: updated }));
    
    // Clear previous timeout
    const existing = saveTimeouts.current[blk.id];
    if (existing) clearTimeout(existing);
    
    // Schedule new save with the updated entry data
    saveTimeouts.current[blk.id] = setTimeout(() => {
      flushBlockSave(blk.id, updated);
    }, 600); // 600ms debounce window
  };

  // Flush daily meta draft
  const flushDailyMeta = useCallback(async () => {
    console.log('[DayDetailForm] flushDailyMeta called, pending:', metaPendingRef.current, 'draft:', dailyMetaDraft);
    if (!metaPendingRef.current) return;
    setIsSaving(true);
    try {
      const dataToSave = {
        sleepQuality: dailyMetaDraft.sleepQuality,
        exerciseMinutes: dailyMetaDraft.exerciseMinutes,
        dailyNotes: dailyMetaDraft.dailyNotes || undefined,
      };
      console.log('[DayDetailForm] Saving daily meta:', dataToSave);
      await saveDailyMeta(dataToSave);
      console.log('[DayDetailForm] Daily meta save successful');
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
    console.log('[DayDetailForm] scheduleMetaSave called, pending:', metaPendingRef.current);
    if (metaTimeoutRef.current) clearTimeout(metaTimeoutRef.current);
    metaPendingRef.current = true;
    metaTimeoutRef.current = setTimeout(() => {
      console.log('[DayDetailForm] scheduleMetaSave timeout fired, calling flushDailyMeta');
      flushDailyMeta();
    }, 700); // 700ms debounce for daily meta
  }, [flushDailyMeta]);

  const handleSleepChange = (v: number) => {
    console.log('[DayDetailForm] handleSleepChange called:', { date, value: v });
    setDailyMetaDraft(d => ({ ...d, sleepQuality: v }));
    scheduleMetaSave();
  };
  const handleExerciseChange = (v: number) => {
    console.log('[DayDetailForm] handleExerciseChange called:', { date, value: v });
    setDailyMetaDraft(d => ({ ...d, exerciseMinutes: v }));
    scheduleMetaSave();
  };
  const handleNotesChange = (v: string) => {
    console.log('[DayDetailForm] handleNotesChange called:', { date, value: v });
    setDailyMetaDraft(d => ({ ...d, dailyNotes: v }));
    scheduleMetaSave();
  };

  const handleTrackDay = async () => {
    try {
      await saveDailyMeta({
        sleepQuality: dailyMetaDraft.sleepQuality,
        exerciseMinutes: dailyMetaDraft.exerciseMinutes,
        dailyNotes: dailyMetaDraft.dailyNotes || undefined,
        tracked: true,
      });
      // Reload to get the updated tracked status
      await reload();
    } catch (e) {
      console.error('[day] track day failed', e);
    }
  };

  // Flush pending saves when date changes
  useEffect(() => {
    // Capture current draft and pending state when date changes
    const prevDate = date;
    
    return () => {
      // Only save if we're changing dates (not just re-rendering)
      const currentDraft = dailyMetaDraft;
      const isPending = metaPendingRef.current;
      
      console.log('[DayDetailForm] Cleanup running. Date was:', prevDate, 'Captured draft:', currentDraft, 'pending:', isPending);
      
      // Clear timeouts
      if (metaTimeoutRef.current) {
        console.log('[DayDetailForm] Clearing meta timeout');
        clearTimeout(metaTimeoutRef.current);
        metaTimeoutRef.current = null;
      }
      Object.values(saveTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
      saveTimeouts.current = {};
      
      // If there were pending changes, save them immediately
      if (isPending) {
        console.log('[DayDetailForm] Saving captured draft in cleanup:', currentDraft);
        saveDailyMeta({
          sleepQuality: currentDraft.sleepQuality,
          exerciseMinutes: currentDraft.exerciseMinutes,
          dailyNotes: currentDraft.dailyNotes || undefined,
        }).then(() => {
          console.log('[DayDetailForm] Cleanup save completed successfully');
        }).catch(e => {
          console.error('[day] cleanup meta save failed', e);
        });
        metaPendingRef.current = false;
      } else {
        console.log('[DayDetailForm] No pending changes in cleanup');
      }
    };
  }, [date, saveDailyMeta]); // Removed dailyMetaDraft from deps!

  return (
    <div className="relative pb-32">
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
      
      {/* Tracking Completion Indicator */}
      {!dayIsTracked && !isLoading && (
        <div className="mb-4 rounded-md border border-lumina-orange-500/30 bg-lumina-orange-500/10 p-4 backdrop-blur-sm" role="status">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <svg className="h-5 w-5 text-lumina-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-lumina-orange-300">Day not tracked yet</h3>
                <p className="mt-1 text-sm text-lumina-orange-200/80">
                  Mark this day as tracked to include it in your stats and analytics.
                </p>
              </div>
            </div>
            <button
              onClick={handleTrackDay}
              className="flex-shrink-0 rounded-md bg-lumina-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lumina-orange-600 focus:outline-none focus:ring-2 focus:ring-lumina-orange-500 focus:ring-offset-2 focus:ring-offset-cinematic-950"
              aria-label="Mark this day as tracked"
            >
              Track This Day
            </button>
          </div>
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
          sleepQuality={dailyMetaDraft.sleepQuality}
          exerciseMinutes={dailyMetaDraft.exerciseMinutes}
          notes={dailyMetaDraft.dailyNotes}
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
