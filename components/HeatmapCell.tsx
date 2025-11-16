'use client';

import React from 'react';

type HeatColor = 'green' | 'yellow' | 'red' | 'gray';

export interface HeatmapCellProps {
  value: number | null;
  label: string; // e.g., date + block label
  color: HeatColor;
  onClick?: () => void;
}

export default function HeatmapCell({ value, label, color, onClick }: HeatmapCellProps) {
  const bg =
    color === 'green'
      ? 'bg-clarity-high hover:bg-clarity-high-200'
      : color === 'yellow'
      ? 'bg-clarity-medium hover:bg-clarity-medium-200'
      : color === 'red'
      ? 'bg-clarity-low hover:bg-clarity-low-200'
      : 'bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600';

  const isInteractive = typeof onClick === 'function';

  const common = 'flex items-center justify-center rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-500 text-[0.7rem] font-medium';

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
        <span className="text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
          {typeof value === 'number' && value <= 1 ? (value * 100).toFixed(0) : String(value)}
        </span>
      ) : (
        <span className="text-zinc-700 dark:text-zinc-300">–</span>
      )}
    </div>
  );

  return content;
}
