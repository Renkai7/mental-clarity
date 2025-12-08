'use client';

import React from 'react';

type HeatColor = 'green' | 'yellow' | 'red' | 'gray';

export interface HeatmapCellProps {
  value: number | null;
  label: string; // e.g., date + block label
  color: HeatColor;
  metric?: 'R' | 'C' | 'A' | 'CI'; // metric type to determine display format
  onClick?: () => void;
}

export default function HeatmapCell({ value, label, color, metric, onClick }: HeatmapCellProps) {
  const bg =
    color === 'green'
      ? 'bg-lumina-orange-500 hover:bg-lumina-orange-400 shadow-glow-orange-sm'
      : color === 'yellow'
      ? 'bg-lumina-amber-500 hover:bg-lumina-amber-400 shadow-glow-amber-sm'
      : color === 'red'
      ? 'bg-red-500/80 hover:bg-red-400/80'
      : 'bg-cinematic-800 hover:bg-cinematic-700';

  const isInteractive = typeof onClick === 'function';

  const common = 'flex items-center justify-center rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lumina-orange-500 text-[0.7rem] font-medium';

  const content = (
    <div
      className={`${bg} ${common}`}
      title={label + (value !== null ? ` — ${value}` : '')}
      aria-label={label + (value !== null ? `, value ${value}` : ', no data')}
      role={isInteractive ? 'button' : 'img'}
      tabIndex={isInteractive ? 0 : -1}
      onKeyDown={(e) => {
        if (!isInteractive) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      onClick={() => onClick?.()}
      style={{ width: 28, height: 28 }}
    >
      {value !== null ? (
        <span className="text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {metric === 'CI' && typeof value === 'number' && value <= 1 ? (value * 100).toFixed(0) : String(value)}
        </span>
      ) : (
        <span className="text-slate-500 font-medium">–</span>
      )}
    </div>
  );

  return content;
}
