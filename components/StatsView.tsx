'use client';

import React from 'react';
import StatsCards from './StatsCards';
import Sparkline from './Sparkline';
import BarCharts from './BarCharts';
import { DEFAULT_TIMEFRAMES } from '@/lib/mockData';
import { useStatsData } from '@/hooks/useStatsData';

export default function StatsView() {
  const { sparkline, blockAverages, barMetric, setBarMetric, isLoading, error } = useStatsData();

  const barData = React.useMemo(() => {
    if (!blockAverages.length) return [];
    return blockAverages.map(b => ({ blockLabel: b.blockLabel, average: b.average }));
  }, [blockAverages]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Statistics</h1>

      <StatsCards />

      <section className="mt-10">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Clarity Index Trend (14 days)</h2>
        <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          {sparkline.length ? (
            <Sparkline data={sparkline} height={140} />
          ) : (
            <div className="h-[120px] flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
              {isLoading ? 'Loading…' : 'No data'}
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">By Timeframe (7-day average)</h2>
          <div className="inline-flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
            {(['R', 'C', 'A'] as const).map((m, idx) => {
              const active = barMetric === m;
              return (
                <button
                  key={m}
                  className={`px-3 py-2 text-sm ${active ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'} ${idx > 0 ? 'border-l border-zinc-300 dark:border-zinc-700' : ''}`}
                  onClick={() => setBarMetric(m)}
                >
                  {m === 'R' ? 'Rumination' : m === 'C' ? 'Compulsions' : 'Avoidance'}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          {barData.length ? (
            <BarCharts metric={barMetric} data={barData} />
          ) : (
            <div className="h-[240px] flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
              {isLoading ? 'Loading…' : 'No block data'}
            </div>
          )}
        </div>
      </section>
      {error && (
        <div className="mt-4 text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </div>
      )}
    </main>
  );
}
