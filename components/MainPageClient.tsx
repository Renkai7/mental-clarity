'use client';

import { useEffect, useMemo, useState } from 'react';
import Tabs, { MetricTab } from './Tabs';
import MainMetricGrid, { MainGridRow } from './MainMetricGrid';
import { useMainGridData } from '@/hooks/useMainGridData';
import { getBlocks, createEmptyDay } from '@/lib/dbUtils';
import type { BlockConfig } from '@/types';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { EmberCard } from '@/ui/cinematic-ember';

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
      .then((b: BlockConfig[]) => {
        if (mounted) setBlocks(b);
      })
      .catch((e: unknown) => {
        if (mounted) setBlocksError(e instanceof Error ? e.message : 'Failed to load timeframes');
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
      // Automatically navigate to today's date after creating entries
      router.push(`/day/${encodeURIComponent(today)}`);
    } catch (error) {
      console.error('Failed to start tracking today:', error);
      router.refresh(); // Fallback to refresh if navigation fails
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Tabs activeTab={active} onTabChange={setActive} />
      <EmberCard
        variant="orange"
        className="p-6"
      >
        <div
          id={`panel-${active}`}
          role="tabpanel"
          aria-labelledby={LABELS[active]}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing: <span className="font-medium text-white">{LABELS[active]}</span>
            </p>
            <button
              type="button"
              onClick={onStartToday}
              disabled={isCreating}
              className="rounded border border-cinematic-800 bg-cinematic-900/60 px-4 py-2 text-sm text-white hover:bg-lumina-orange-500/20 hover:border-lumina-orange-500 hover:shadow-glow-orange hover:scale-105 transition-all duration-300 disabled:opacity-60 cursor-pointer"
              aria-label="Start tracking today and navigate to today's entry form"
              title="Opens today's entry form for tracking"
            >
              {isCreating ? 'Opening…' : 'Track Today'}
            </button>
          </div>
          {(isLoading || isBlocksLoading) && (
            <div className="animate-pulse text-sm text-slate-400">Loading {LABELS[active]}…</div>
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
            <p className="mt-3 text-sm text-red-400">{error || blocksError}</p>
          )}
          {!isLoading && !isBlocksLoading && hasMore && (
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoading}
                className="rounded border border-cinematic-800 bg-cinematic-900/60 px-4 py-2 text-sm text-white hover:bg-cinematic-800 hover:shadow-glow-orange transition-all disabled:opacity-60"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </EmberCard>
    </div>
  );
}
