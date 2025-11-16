"use client";

import React from "react";

interface DailyTotalsProps {
  ruminationTotal: number;
  compulsionsTotal: number;
  avoidanceTotal: number;
}

export default function DailyTotals({
  ruminationTotal,
  compulsionsTotal,
  avoidanceTotal,
}: DailyTotalsProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-700 dark:bg-black/95">
      <div className="mx-auto max-w-4xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Daily Totals
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                R
              </span>
              <span
                className="min-w-[3rem] rounded-md bg-red-100 px-3 py-1.5 text-center text-sm font-semibold tabular-nums text-red-900 dark:bg-red-950 dark:text-red-100"
                aria-label={`Total rumination: ${ruminationTotal}`}
              >
                {ruminationTotal}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                C
              </span>
              <span
                className="min-w-[3rem] rounded-md bg-blue-100 px-3 py-1.5 text-center text-sm font-semibold tabular-nums text-blue-900 dark:bg-blue-950 dark:text-blue-100"
                aria-label={`Total compulsions: ${compulsionsTotal}`}
              >
                {compulsionsTotal}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                A
              </span>
              <span
                className="min-w-[3rem] rounded-md bg-orange-100 px-3 py-1.5 text-center text-sm font-semibold tabular-nums text-orange-900 dark:bg-orange-950 dark:text-orange-100"
                aria-label={`Total avoidance: ${avoidanceTotal}`}
              >
                {avoidanceTotal}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
