'use client';

import React from 'react';
import KPICard from './KPICard';
import { getMockMainGridData, getMockHeatmapData } from '@/lib/mockData';

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
  const rRows = getMockMainGridData('R');
  const cRows = getMockMainGridData('C');
  const aRows = getMockMainGridData('A');
  const todayR = rRows[0]?.total ?? 0;
  const todayC = cRows[0]?.total ?? 0;
  const todayA = aRows[0]?.total ?? 0;

  const ciDays = getMockHeatmapData('CI', 14);
  const todayCIBlocks = ciDays[0]?.blocks ?? [];
  const todayCIValues = todayCIBlocks.map(b => (typeof b.value === 'number' ? b.value : null)).filter((v): v is number => v !== null);
  const todayCI = todayCIValues.length ? todayCIValues.reduce((s, v) => s + v, 0) / todayCIValues.length : 0.5;

  const last7 = getMockHeatmapData('CI', 7);
  const sevenAvg = (() => {
    const vals: number[] = [];
    last7.forEach(d => {
      const ns = d.blocks.map(b => (typeof b.value === 'number' ? b.value : null)).filter((v): v is number => v !== null);
      if (ns.length) vals.push(ns.reduce((s, v) => s + v, 0) / ns.length);
    });
    if (!vals.length) return 0.5;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  })();

  const today = new Date().toISOString().slice(0, 10);
  const rand = seededRandom('streak' + today);
  const streak = Math.floor(3 + rand() * 12); // 3..14 days

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
    </section>
  );
}
