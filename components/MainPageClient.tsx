'use client';

import { useEffect, useMemo, useState } from 'react';
import Tabs, { MetricTab } from './Tabs';
import MainMetricGrid, { MainGridRow } from './MainMetricGrid';
import { useMainGridData } from '@/hooks/useMainGridData';
import { getBlocks, createEmptyDay } from '@/lib/dbUtils';
import type { BlockConfig } from '@/types';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const LABELS: Record<MetricTab, string> = {
  R: 'Rumination',
  C: 'Compulsions',
  A: 'Avoidance',
};

export default function MainPageClient() {
  const [active, setActive] = useState<MetricTab>('R');
  const { data, isLoading, error, loadMore, hasMore } = useMainGridData(active, 30);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // Load configured blocks for ordered column headers
  const [blocks, setBlocks] = useState<BlockConfig[] | null>(null);
  const [isBlocksLoading, setIsBlocksLoading] = useState<boolean>(false);
  const [blocksError, setBlocksError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsBlocksLoading(true);
    setBlocksError(null);
    getBlocks()
      .then((b) => {
        if (mounted) setBlocks(b);
      })
      .catch((e) => {
        if (mounted) setBlocksError(e?.message ?? 'Failed to load timeframes');
      })
      .finally(() => {
        if (mounted) setIsBlocksLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const columns = useMemo(
    () => (blocks ?? []).map((b) => ({ id: b.id, label: b.label })),
    [blocks]
  );

  const onStartToday = async () => {
    try {
      setIsCreating(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      await createEmptyDay(today);
      router.refresh();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Tabs activeTab={active} onTabChange={setActive} />
      <div
        id={`panel-${active}`}
        role="tabpanel"
        aria-labelledby={LABELS[active]}
        className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-black"
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Showing: <span className="font-medium text-zinc-900 dark:text-zinc-100">{LABELS[active]}</span>
          </p>
          <button
            type="button"
            onClick={onStartToday}
            disabled={isCreating}
            className="rounded border px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-60"
            aria-label="Start tracking today"
            title="Creates today's empty entries and shows them in the grid"
          >
            {isCreating ? 'Creating…' : 'Start tracking today'}
          </button>
        </div>
        {(isLoading || isBlocksLoading) && (
          <div className="animate-pulse text-sm text-zinc-500">Loading {LABELS[active]}…</div>
        )}
        {!isLoading && !isBlocksLoading && (
          <MainMetricGrid
            metric={active}
            metricLabel={LABELS[active]}
            data={data as MainGridRow[]}
            columns={columns}
          />
        )}
        {(error || blocksError) && (
          <p className="mt-3 text-sm text-red-600">{error || blocksError}</p>
        )}
        {!isLoading && !isBlocksLoading && hasMore && (
          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoading}
              className="rounded border px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-60"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
