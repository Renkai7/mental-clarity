'use client';
import HistoryView from '../HistoryView';
import { EmberShell } from '@/ui/cinematic-ember';

export default function HistoryViewContainer() {
  return (
    <EmberShell className="max-w-5xl">
      <h1 className="mb-6 text-3xl font-bold text-white">History</h1>
      <HistoryView />
    </EmberShell>
  );
}
