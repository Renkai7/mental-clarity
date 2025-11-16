'use client';

import React from 'react';
import StatsCards from './StatsCards';
import Sparkline from './Sparkline';
import BarCharts from './BarCharts';
import { getMockHeatmapData, getMockMainGridData, DEFAULT_TIMEFRAMES } from '@/lib/mockData';

export default function StatsView() {
  const [barMetric, setBarMetric] = React.useState<'R' | 'C' | 'A'>('R');

  const sparklineData = React.useMemo(() => {
    const days = getMockHeatmapData('CI', 14).slice().reverse(); // oldest -> newest
    return days.map((d) => {
      const vals = d.blocks.map(b => (typeof b.value === 'number' ? b.value : null)).filter((v): v is number => v !== null);
      const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0.5;
      return { date: d.date, value: Number(avg.toFixed(2)) };
    });
  }, []);

  const barData = React.useMemo(() => {
    const rows = getMockMainGridData(barMetric).slice(0, 7); // last 7 days
    const sums: Record<string, { total: number; count: number }> = {};
    DEFAULT_TIMEFRAMES.forEach(label => {
      sums[label] = { total: 0, count: 0 };
    });
    rows.forEach(r => {
      DEFAULT_TIMEFRAMES.forEach(label => {
        const v = r.timeframes[label] ?? 0;
        sums[label].total += v;
        sums[label].count += 1;
      });
    });
    return DEFAULT_TIMEFRAMES.map(label => ({ blockLabel: label, average: Math.round(sums[label].total / Math.max(1, sums[label].count)) }));
  }, [barMetric]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Statistics</h1>

      <StatsCards />

      <section className="mt-10">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Clarity Index Trend (14 days)</h2>
        <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <Sparkline data={sparklineData} height={140} />
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
          <BarCharts metric={barMetric} data={barData} />
        </div>
      </section>
    </main>
  );
}
