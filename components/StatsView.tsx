'use client';

import React from 'react';
import StatsCards from './StatsCards';
import Sparkline from './Sparkline';
import BarCharts from './BarCharts';
import { DEFAULT_TIMEFRAMES } from '@/lib/mockData';
import { useStatsData } from '@/hooks/useStatsData';
import { EmberCard } from '@/ui/cinematic-ember';

export default function StatsView() {
  const { sparkline, blockAverages, barMetric, setBarMetric, isLoading, error, kpis } = useStatsData();

  const barData = React.useMemo(() => {
    if (!blockAverages.length) return [];
    return blockAverages.map(b => ({ blockLabel: b.blockLabel, average: b.average }));
  }, [blockAverages]);

  return (
    <div className="space-y-10">
      <StatsCards />

      <section>
        <h2 className="text-lg font-medium text-white mb-4">Clarity Index Trend (14 days)</h2>
        <EmberCard variant="orange" className="p-6">
          {sparkline.length ? (
            <Sparkline data={sparkline} height={140} />
          ) : (
            <div className="h-[120px] flex items-center justify-center text-xs text-slate-400">
              {isLoading ? 'Loading…' : 'No data'}
            </div>
          )}
        </EmberCard>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">
            By Timeframe (7-day average)
            {kpis?.sevenTrackedCount != null && (
              <span className="text-sm text-zinc-400 font-normal ml-2">
                ({kpis.sevenTrackedCount} of 7 days tracked)
              </span>
            )}
          </h2>
          <div className="inline-flex overflow-hidden rounded-lg border border-cinematic-800">
            {(['R', 'C', 'A'] as const).map((m, idx) => {
              const active = barMetric === m;
              return (
                <button
                  key={m}
                  className={`px-3 py-2 text-sm ${active ? 'bg-lumina-orange-500 text-white' : 'bg-cinematic-900/60 text-slate-300'} ${idx > 0 ? 'border-l border-cinematic-800' : ''} transition-all`}
                  onClick={() => setBarMetric(m)}
                >
                  {m === 'R' ? 'Rumination' : m === 'C' ? 'Compulsions' : 'Avoidance'}
                </button>
              );
            })}
          </div>
        </div>
        <EmberCard variant="amber" className="p-6">
          {barData.length ? (
            <BarCharts metric={barMetric} data={barData} />
          ) : (
            <div className="h-[240px] flex items-center justify-center text-xs text-slate-400">
              {isLoading ? 'Loading…' : 'No block data'}
            </div>
          )}
        </EmberCard>
      </section>
      {error && (
        <div className="mt-4 text-xs text-red-400" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
