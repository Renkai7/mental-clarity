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
          <div className="text-xs font-medium text-slate-400 py-2 pr-2">Date</div>
          {DEFAULT_BLOCKS.map((label) => (
            <div key={label} className="text-xs text-center font-medium text-slate-400 py-2">
              {label.replace('AM', '').replace('PM', '')}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="mt-1 space-y-2">
          {data.map((day) => (
            <div key={day.date} className="grid items-center" style={{ gridTemplateColumns: `120px repeat(${DEFAULT_BLOCKS.length}, 32px)` }}>
              <div className="text-sm text-slate-300 pr-2">{formatShortDate(day.date)}</div>
              {day.blocks.map((b, idx) => (
                <div key={`${day.date}-${idx}`} className="p-1">
                  <HeatmapCell
                    value={b.value}
                    label={`${formatShortDate(day.date)} • ${b.blockId}`}
                    color={b.color}
                    metric={metric}
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
              className="px-4 py-2 text-sm rounded-md border border-cinematic-800 bg-cinematic-900/60 text-white hover:bg-cinematic-800 hover:shadow-glow-orange transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lumina-orange-500 disabled:opacity-50"
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
