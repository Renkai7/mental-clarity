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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-cinematic-800 bg-cinematic-950/95 backdrop-blur-sm shadow-glow-orange-sm">
      <div className="mx-auto max-w-4xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium text-white">
            Daily Totals
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                R
              </span>
              <span
                className="min-w-[3rem] rounded-md bg-lumina-orange-500/20 px-3 py-1.5 text-center text-sm font-semibold tabular-nums text-lumina-orange-400 border border-lumina-orange-500/30"
                aria-label={`Total rumination: ${ruminationTotal}`}
              >
                {ruminationTotal}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                C
              </span>
              <span
                className="min-w-[3rem] rounded-md bg-lumina-amber-500/20 px-3 py-1.5 text-center text-sm font-semibold tabular-nums text-lumina-amber-400 border border-lumina-amber-500/30"
                aria-label={`Total compulsions: ${compulsionsTotal}`}
              >
                {compulsionsTotal}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                A
              </span>
              <span
                className="min-w-[3rem] rounded-md bg-lumina-orange-500/20 px-3 py-1.5 text-center text-sm font-semibold tabular-nums text-lumina-orange-400 border border-lumina-orange-500/30"
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
