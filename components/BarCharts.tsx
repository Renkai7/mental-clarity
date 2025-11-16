'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import type { BarChartsImplProps } from './BarChartsImpl';

const LazyBarCharts = dynamic(() => import('./BarChartsImpl'), {
  ssr: false,
  loading: () => <div className="h-[260px] w-full rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" aria-label="Loading chart" />,
});

export default function BarCharts(props: BarChartsImplProps) {
  return <LazyBarCharts {...props} />;
}
