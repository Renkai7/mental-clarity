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
  
  // Handle tracked vs untracked days
  const todayIsTracked = kpis?.todayIsTracked ?? false;
  const todayCI = todayIsTracked && kpis?.todayCI != null 
    ? formatPercent(kpis.todayCI) 
    : 'Not tracked yet';
  const todayCISubtitle = todayCI === 'Not tracked yet' 
    ? 'Fill out daily summary' 
    : '0% worst • 100% best';
  const todayCIColor = todayCI === 'Not tracked yet' 
    ? 'text-zinc-400' 
    : 'text-emerald-600';
  
  const sevenAvg = kpis?.sevenAvgCI != null 
    ? formatPercent(kpis.sevenAvgCI) 
    : '—';
  const sevenSubtitle = kpis?.sevenTrackedCount != null
    ? `${kpis.sevenTrackedCount} of 7 days tracked`
    : 'No tracked days';
  const sevenAvgColor = sevenAvg === '—' ? 'text-zinc-400' : 'text-emerald-600';
  
  const streak = kpis?.streakDays ?? 0;
  const streakSubtitle = streak > 0 ? 'Keep it up!' : 'Start tracking today';
  const streakColor = streak > 0 ? 'text-lumina-orange-500' : 'text-zinc-400';

  return (
    <section aria-label="stats-kpis" className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Today's Rumination" value={todayR} subtitle="Total across all timeframes" colorClassName="text-zinc-900 dark:text-zinc-100" />
        <KPICard title="Today's Compulsions" value={todayC} subtitle="Total across all timeframes" colorClassName="text-zinc-900 dark:text-zinc-100" />
        <KPICard title="Today's Avoidance" value={todayA} subtitle="Total across all timeframes" colorClassName="text-zinc-900 dark:text-zinc-100" />
        <KPICard title="Today's Clarity Index" value={todayCI} subtitle={todayCISubtitle} colorClassName={todayCIColor} />
        <KPICard title="7-Day Avg CI" value={sevenAvg} subtitle={sevenSubtitle} colorClassName={sevenAvgColor} />
        <KPICard title="Current Streak" value={`${streak} days`} subtitle={streakSubtitle} colorClassName={streakColor} />
      </div>
      {isLoading && <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Loading KPIs…</div>}
    </section>
  );
}
