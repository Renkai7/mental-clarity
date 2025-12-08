'use client';
import StatsView from '../StatsView';
import { EmberShell } from '@/ui/cinematic-ember';

export default function StatsViewContainer() {
  return (
    <EmberShell className="max-w-5xl">
      <h1 className="mb-6 text-3xl font-bold text-white">Stats</h1>
      <StatsView />
    </EmberShell>
  );
}
