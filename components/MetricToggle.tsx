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
    <div role="radiogroup" aria-label="Select heatmap metric" className="inline-flex rounded-lg border border-cinematic-800 overflow-hidden">
      {OPTIONS.map((opt, idx) => {
        const isActive = opt.key === activeMetric;
        return (
          <button
            key={opt.key}
            role="radio"
            aria-checked={isActive}
            className={`px-3 py-2 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lumina-orange-500 ${
              isActive ? 'bg-lumina-orange-500 text-white shadow-glow-orange' : 'bg-cinematic-900/60 text-slate-300 hover:bg-cinematic-800 hover:text-white'
            } ${idx > 0 ? 'border-l border-cinematic-800' : ''}`}
            onClick={() => onMetricChange(opt.key)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
