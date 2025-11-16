'use client';

import React from 'react';

export interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  colorClassName?: string;
}

export default function KPICard({ title, value, subtitle, trend = 'neutral', colorClassName }: KPICardProps) {
  const trendIcon = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '•';
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-zinc-400';

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</div>
      <div className={`mt-2 text-2xl font-semibold tracking-tight ${colorClassName ?? 'text-zinc-900 dark:text-zinc-100'}`}>{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className={trendColor} aria-hidden>
          {trendIcon}
        </span>
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  );
}
