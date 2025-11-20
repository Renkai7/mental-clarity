'use client';
import StatsView from '../StatsView';

export default function StatsViewContainer() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Stats</h1>
      <StatsView />
    </main>
  );
}
