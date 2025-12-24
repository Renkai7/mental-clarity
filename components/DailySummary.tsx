"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

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
  
  // Track the previous date to detect navigation
  const prevDateRef = useRef<string | null>(null);
  const prevPropsRef = useRef({ sleepQuality, exerciseMinutes, notes });

  // Sync props to state on initial mount, date change, OR when props change from database reload
  useEffect(() => {
    const dateChanged = prevDateRef.current !== date;
    const propsChanged = 
      prevPropsRef.current.sleepQuality !== sleepQuality ||
      prevPropsRef.current.exerciseMinutes !== exerciseMinutes ||
      prevPropsRef.current.notes !== notes;
    
    if (prevDateRef.current === null || dateChanged || propsChanged) {
      console.log('[DailySummary] Syncing props to state:', { date, sleepQuality, exerciseMinutes, notes, reason: prevDateRef.current === null ? 'mount' : dateChanged ? 'date-change' : 'props-changed' });
      setSleep(clamp(sleepQuality, 1, 10));
      setExercise(clamp(exerciseMinutes, 0, 300));
      setDailyNotes(notes);
      prevDateRef.current = date;
      prevPropsRef.current = { sleepQuality, exerciseMinutes, notes };
    }
  }, [date, sleepQuality, exerciseMinutes, notes]);

  const dateLabel = useMemo(() => formatShort(date), [date]);

  const setSleepAndNotify = (v: number) => {
    const nv = clamp(v, 1, 10);
    console.log('[DailySummary] setSleepAndNotify called:', { value: v, clamped: nv, hasCallback: !!onSleepQualityChange });
    setSleep(nv);
    if (onSleepQualityChange) {
      console.log('[DailySummary] Calling onSleepQualityChange with:', nv);
      onSleepQualityChange(nv);
    } else {
      console.warn('[DailySummary] onSleepQualityChange callback is undefined!');
    }
  };
  const decSleep = () => setSleepAndNotify(sleep - 1);
  const incSleep = () => setSleepAndNotify(sleep + 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Sleep Quality */}
        <div className="flex flex-col">
          <Label htmlFor="sleepQuality" className="mb-1">
            Sleep Quality (1–10)
          </Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={decSleep}
              aria-label="Decrease sleep quality"
              variant="subtle"
              className="h-10 w-10 px-0"
              disabled={sleep <= 1}
            >
              −
            </Button>
            <Input
              id="sleepQuality"
              name="sleepQuality"
              type="number"
              min={1}
              max={10}
              step={1}
              value={sleep}
              onChange={(e) => setSleepAndNotify(parseInt(e.target.value, 10))}
              density="md"
              tabularNums
              className="w-full text-right"
              inputMode="numeric"
            />
            <Button
              type="button"
              onClick={incSleep}
              aria-label="Increase sleep quality"
              variant="subtle"
              className="h-10 w-10 px-0"
              disabled={sleep >= 10}
            >
              +
            </Button>
          </div>
          <p className="mt-1 text-xs text-slate-400">How well you slept last night.</p>
        </div>

        {/* Exercise Minutes */}
        <div className="flex flex-col">
          <Label htmlFor="exerciseMinutes" className="mb-1">
            Exercise (minutes)
          </Label>
          <Input
            id="exerciseMinutes"
            name="exerciseMinutes"
            type="number"
            min={0}
            max={300}
            step={5}
            value={exercise}
            onChange={(e) => {
              const nv = clamp(parseInt(e.target.value, 10), 0, 300);
              console.log('[DailySummary] Exercise onChange:', { value: nv, hasCallback: !!onExerciseMinutesChange });
              setExercise(nv);
              if (onExerciseMinutesChange) {
                console.log('[DailySummary] Calling onExerciseMinutesChange with:', nv);
                onExerciseMinutesChange(nv);
              } else {
                console.warn('[DailySummary] onExerciseMinutesChange callback is undefined!');
              }
            }}
            density="md"
            tabularNums
            className="w-full text-right"
            inputMode="numeric"
          />
          <p className="mt-1 text-xs text-slate-400">Total exercise minutes for {dateLabel}.</p>
        </div>

        {/* Placeholder to balance grid on sm screens */}
        <div className="hidden sm:block" />
      </div>

      {/* Daily Notes */}
      <div className="flex flex-col">
        <Label htmlFor="dailyNotes" className="mb-1">
          Daily Notes
        </Label>
        <Textarea
          id="dailyNotes"
          name="dailyNotes"
          rows={4}
          value={dailyNotes}
          onChange={(e) => {
            const v = e.target.value;
            console.log('[DailySummary] Notes onChange:', { value: v, hasCallback: !!onNotesChange });
            setDailyNotes(v);
            if (onNotesChange) {
              console.log('[DailySummary] Calling onNotesChange with:', v);
              onNotesChange(v);
            } else {
              console.warn('[DailySummary] onNotesChange callback is undefined!');
            }
          }}
          placeholder="Anything notable about your day…"
          density="md"
          className="w-full resize-y"
        />
      </div>
    </div>
  );
}
