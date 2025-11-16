'use client';

import React from 'react';
import MetricToggle, { HeatmapMetric } from './MetricToggle';
import Heatmap from './Heatmap';
import { getMockHeatmapData, type HeatmapDayData } from '@/lib/mockData';

export default function HistoryView() {
  const [metric, setMetric] = React.useState<HeatmapMetric>('CI');
  const [data, setData] = React.useState<HeatmapDayData[]>([]);
  const [loadedDays, setLoadedDays] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const DAYS_PER_PAGE = 30;

  const loadInitial = React.useCallback((m: HeatmapMetric) => {
    setIsLoading(true);
    const rows = getMockHeatmapData(m, DAYS_PER_PAGE, 0);
    setData(rows);
    setLoadedDays(rows.length);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadInitial(metric);
  }, [metric, loadInitial]);

  const handleLoadMore = React.useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    const rows = getMockHeatmapData(metric, DAYS_PER_PAGE, loadedDays);
    setData((prev) => {
      // Avoid duplicates by date (in case of overlap)
      const existing = new Set(prev.map((d) => d.date));
      const merged = [...prev, ...rows.filter((r) => !existing.has(r.date))];
      // Already sorted desc by generator; ensure sort desc
      merged.sort((a, b) => (a.date < b.date ? 1 : -1));
      return merged;
    });
    setLoadedDays((n) => n + rows.length);
    setIsLoading(false);
  }, [metric, loadedDays, isLoading]);

  return (
    <section aria-label="history-heatmap" className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Heatmap</h2>
        <MetricToggle activeMetric={metric} onMetricChange={setMetric} />
      </div>

      <div className="mt-4">
        {isLoading && data.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</div>
        ) : (
          <Heatmap metric={metric} data={data} onLoadMore={handleLoadMore} canLoadMore={!isLoading} />
        )}
      </div>
    </section>
  );
}
