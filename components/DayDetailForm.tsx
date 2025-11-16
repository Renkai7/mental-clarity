"use client";

import React, { useState, useMemo } from "react";
import DailySummary from "./DailySummary";
import TimeframeGrid, { TimeframeEntry } from "./TimeframeGrid";
import DailyTotals from "./DailyTotals";
import { DEFAULT_TIMEFRAMES } from "../lib/mockData";

interface DayDetailFormProps {
  date: string;
}

export default function DayDetailForm({ date }: DayDetailFormProps) {
  // Daily meta state
  const [sleepQuality, setSleepQuality] = useState(7);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [dailyNotes, setDailyNotes] = useState("");

  // Timeframe entries state
  const [entries, setEntries] = useState<TimeframeEntry[]>(() =>
    DEFAULT_TIMEFRAMES.map((label) => ({
      blockLabel: label,
      rumination: 0,
      compulsions: 0,
      avoidance: 0,
      anxiety: 5,
      stress: 5,
      notes: "",
    }))
  );

  // Compute daily totals
  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => ({
        rumination: acc.rumination + entry.rumination,
        compulsions: acc.compulsions + entry.compulsions,
        avoidance: acc.avoidance + entry.avoidance,
      }),
      { rumination: 0, compulsions: 0, avoidance: 0 }
    );
  }, [entries]);

  const handleEntryChange = (index: number, updatedEntry: TimeframeEntry) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? updatedEntry : entry))
    );
  };

  return (
    <div className="relative pb-24">
      {/* Daily Summary Section */}
      <section
        aria-labelledby="daily-summary"
        className="mb-8 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-black"
      >
        <h2
          id="daily-summary"
          className="mb-3 text-lg font-medium text-zinc-900 dark:text-zinc-100"
        >
          Daily Summary
        </h2>
        <DailySummary
          date={date}
          sleepQuality={sleepQuality}
          exerciseMinutes={exerciseMinutes}
          notes={dailyNotes}
          onSleepQualityChange={setSleepQuality}
          onExerciseMinutesChange={setExerciseMinutes}
          onNotesChange={setDailyNotes}
        />
      </section>

      {/* Timeframes Section */}
      <section
        aria-labelledby="timeframe-grid"
        className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-black"
      >
        <h2
          id="timeframe-grid"
          className="mb-3 text-lg font-medium text-zinc-900 dark:text-zinc-100"
        >
          Timeframes
        </h2>
        <TimeframeGrid entries={entries} onEntryChange={handleEntryChange} />
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
