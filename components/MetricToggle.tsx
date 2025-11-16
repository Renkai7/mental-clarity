'use client';

import React from 'react';

export type HeatmapMetric = 'CI' | 'R' | 'C' | 'A';

export interface MetricToggleProps {
  activeMetric: HeatmapMetric;
  onMetricChange: (metric: HeatmapMetric) => void;
}

const OPTIONS: { key: HeatmapMetric; label: string }[] = [
  { key: 'CI', label: 'Clarity Index' },
  { key: 'R', label: 'Rumination' },
  { key: 'C', label: 'Compulsions' },
  { key: 'A', label: 'Avoidance' },
];

export default function MetricToggle({ activeMetric, onMetricChange }: MetricToggleProps) {
  return (
    <div role="radiogroup" aria-label="Select heatmap metric" className="inline-flex rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden">
      {OPTIONS.map((opt, idx) => {
        const isActive = opt.key === activeMetric;
        return (
          <button
            key={opt.key}
            role="radio"
            aria-checked={isActive}
            className={`px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-500 ${
              isActive ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
            } ${idx > 0 ? 'border-l border-zinc-300 dark:border-zinc-700' : ''}`}
            onClick={() => onMetricChange(opt.key)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
