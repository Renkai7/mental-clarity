'use client';

import { useState } from 'react';
import Tabs, { MetricTab } from './Tabs';
import MainMetricGrid from './MainMetricGrid';

const LABELS: Record<MetricTab, string> = {
  R: 'Rumination',
  C: 'Compulsions',
  A: 'Avoidance',
};

export default function MainPageClient() {
  const [active, setActive] = useState<MetricTab>('R');

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Tabs activeTab={active} onTabChange={setActive} />
      <div
        id={`panel-${active}`}
        role="tabpanel"
        aria-labelledby={LABELS[active]}
        className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-black"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-2">
          Showing: <span className="font-medium text-zinc-900 dark:text-zinc-100">{LABELS[active]}</span>
        </p>
        <MainMetricGrid metric={active} />
      </div>
    </div>
  );
}
