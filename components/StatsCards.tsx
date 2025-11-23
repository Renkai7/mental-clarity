'use client';

import React from 'react';
import KPICard from './KPICard';
import { useStatsData } from '@/hooks/useStatsData';

function formatPercent(n: number) {
  return `${Math.round(n * 100)}%`;
}

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return (h >>> 0) / 4294967295;
  };
}

export default function StatsCards() {
  const { kpis, isLoading } = useStatsData();
  const todayR = kpis?.todayR ?? 0;
  const todayC = kpis?.todayC ?? 0;
  const todayA = kpis?.todayA ?? 0;
  const todayCI = kpis?.todayCI ?? 0;
  const sevenAvg = kpis?.sevenAvgCI ?? 0;
  const streak = kpis?.streakDays ?? 0;

  return (
    <section aria-label="stats-kpis" className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Today's Rumination" value={todayR} subtitle="Total across all timeframes" colorClassName="text-zinc-900 dark:text-zinc-100" />
        <KPICard title="Today's Compulsions" value={todayC} subtitle="Total across all timeframes" colorClassName="text-zinc-900 dark:text-zinc-100" />
        <KPICard title="Today's Avoidance" value={todayA} subtitle="Total across all timeframes" colorClassName="text-zinc-900 dark:text-zinc-100" />
        <KPICard title="Today's Clarity Index" value={formatPercent(todayCI)} subtitle="0% worst • 100% best" colorClassName="text-emerald-600" />
        <KPICard title="7-Day Avg CI" value={formatPercent(sevenAvg)} subtitle="Average of last 7 days" colorClassName="text-emerald-600" />
        <KPICard title="Current Streak" value={`${streak} days`} subtitle="Consecutive days logged" />
      </div>
      {isLoading && <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Loading KPIs…</div>}
    </section>
  );
}
