'use client';

import React from 'react';
import MetricToggle, { HeatmapMetric } from './MetricToggle';
import Heatmap from './Heatmap';
import { useHeatmapData } from '@/hooks/useHeatmapData';

export default function HistoryView() {
  const [metric, setMetric] = React.useState<HeatmapMetric>('CI');
  const { days, loadMore, canLoadMore, isLoading, error } = useHeatmapData(metric);

  return (
    <section aria-label="history-heatmap" className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Heatmap</h2>
        <MetricToggle activeMetric={metric} onMetricChange={setMetric} />
      </div>

      <div className="mt-4">
        {isLoading && days.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</div>
        ) : (
          <>
            {error && <div className="text-xs text-red-600 dark:text-red-400 mb-2">{error}</div>}
            <Heatmap metric={metric} data={days} onLoadMore={loadMore} canLoadMore={canLoadMore} />
          </>
        )}
      </div>
    </section>
  );
}
