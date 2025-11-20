'use client';
import HistoryView from '../HistoryView';

export default function HistoryViewContainer() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">History</h1>
      <HistoryView />
    </main>
  );
}
