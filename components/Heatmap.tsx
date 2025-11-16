'use client';

import React from 'react';
import HeatmapCell from './HeatmapCell';
import { useRouter } from 'next/navigation';
import type { HeatmapDayData, HeatmapMetric, DEFAULT_TIMEFRAMES } from '@/lib/mockData';
import { DEFAULT_TIMEFRAMES as DEFAULT_BLOCKS } from '@/lib/mockData';

export interface HeatmapProps {
  metric: HeatmapMetric;
  data: HeatmapDayData[];
  onLoadMore?: () => void;
  canLoadMore?: boolean;
}

function formatShortDate(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function Heatmap({ metric, data, onLoadMore, canLoadMore = true }: HeatmapProps) {
  const router = useRouter();

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[560px]">
        {/* Column headers */}
        <div className="grid" style={{ gridTemplateColumns: `120px repeat(${DEFAULT_BLOCKS.length}, 32px)` }}>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 py-2 pr-2">Date</div>
          {DEFAULT_BLOCKS.map((label) => (
            <div key={label} className="text-xs text-center font-medium text-zinc-500 dark:text-zinc-400 py-2">
              {label.replace('AM', '').replace('PM', '')}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="mt-1 space-y-2">
          {data.map((day) => (
            <div key={day.date} className="grid items-center" style={{ gridTemplateColumns: `120px repeat(${DEFAULT_BLOCKS.length}, 32px)` }}>
              <div className="text-sm text-zinc-800 dark:text-zinc-200 pr-2">{formatShortDate(day.date)}</div>
              {day.blocks.map((b, idx) => (
                <div key={`${day.date}-${idx}`} className="p-1">
                  <HeatmapCell
                    value={b.value}
                    label={`${formatShortDate(day.date)} • ${b.blockId}`}
                    color={b.color}
                    onClick={() => router.push(`/day/${encodeURIComponent(day.date)}`)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Load More */}
        {onLoadMore && (
          <div className="mt-6 flex justify-center">
            <button
              className="px-4 py-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-500 disabled:opacity-50"
              onClick={() => onLoadMore()}
              disabled={!canLoadMore}
              aria-disabled={!canLoadMore}
            >
              {canLoadMore ? 'Load More' : 'All data loaded'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
