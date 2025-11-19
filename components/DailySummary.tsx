"use client";

import { useMemo, useState } from "react";

export interface DailySummaryProps {
  date: string;
  sleepQuality?: number; // 1..10
  exerciseMinutes?: number; // 0..300
  notes?: string;
  onSleepQualityChange?: (value: number) => void;
  onExerciseMinutesChange?: (value: number) => void;
  onNotesChange?: (value: string) => void;
}

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number.isFinite(num) ? num : min));
}

function formatShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, d))
  );
}

export default function DailySummary({
  date,
  sleepQuality = 7,
  exerciseMinutes = 0,
  notes = "",
  onSleepQualityChange,
  onExerciseMinutesChange,
  onNotesChange,
}: DailySummaryProps) {
  const [sleep, setSleep] = useState<number>(clamp(sleepQuality, 1, 10));
  const [exercise, setExercise] = useState<number>(clamp(exerciseMinutes, 0, 300));
  const [dailyNotes, setDailyNotes] = useState<string>(notes);

  const dateLabel = useMemo(() => formatShort(date), [date]);

  const setSleepAndNotify = (v: number) => {
    const nv = clamp(v, 1, 10);
    setSleep(nv);
    onSleepQualityChange?.(nv);
  };
  const decSleep = () => setSleepAndNotify(sleep - 1);
  const incSleep = () => setSleepAndNotify(sleep + 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Sleep Quality */}
        <div className="flex flex-col">
          <label htmlFor="sleepQuality" className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Sleep Quality (1–10)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decSleep}
              aria-label="Decrease sleep quality"
              className="rounded-md border border-zinc-300 px-2 py-1 text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              disabled={sleep <= 1}
            >
              −
            </button>
            <input
              id="sleepQuality"
              name="sleepQuality"
              type="number"
              min={1}
              max={10}
              step={1}
              value={sleep}
              onChange={(e) => setSleepAndNotify(parseInt(e.target.value, 10))}
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-right tabular-nums outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700"
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={incSleep}
              aria-label="Increase sleep quality"
              className="rounded-md border border-zinc-300 px-2 py-1 text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              disabled={sleep >= 10}
            >
              +
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">How well you slept last night.</p>
        </div>

        {/* Exercise Minutes */}
        <div className="flex flex-col">
          <label htmlFor="exerciseMinutes" className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Exercise (minutes)
          </label>
          <input
            id="exerciseMinutes"
            name="exerciseMinutes"
            type="number"
            min={0}
            max={300}
            step={5}
            value={exercise}
            onChange={(e) => {
              const nv = clamp(parseInt(e.target.value, 10), 0, 300);
              setExercise(nv);
              onExerciseMinutesChange?.(nv);
            }}
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-right tabular-nums outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700"
            inputMode="numeric"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Total exercise minutes for {dateLabel}.</p>
        </div>

        {/* Placeholder to balance grid on sm screens */}
        <div className="hidden sm:block" />
      </div>

      {/* Daily Notes */}
      <div className="flex flex-col">
        <label htmlFor="dailyNotes" className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">
          Daily Notes
        </label>
        <textarea
          id="dailyNotes"
          name="dailyNotes"
          rows={4}
          value={dailyNotes}
          onChange={(e) => {
            const v = e.target.value;
            setDailyNotes(v);
            onNotesChange?.(v);
          }}
          placeholder="Anything notable about your day…"
          className="w-full resize-y rounded-md border border-zinc-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700"
        />
      </div>
    </div>
  );
}
