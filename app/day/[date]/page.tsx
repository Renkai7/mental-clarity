import Link from 'next/link';
import { notFound } from 'next/navigation';
import DailySummary from '../../../components/DailySummary';

interface DayDetailPageProps {
  params: Promise<{ date: string }>;
}

function isValidDateStr(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  // Ensure date components round-trip (e.g., avoid 2025-13-40)
  return (
    dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
  );
}

function formatFullDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(dt);
}

export default async function DayDetailPage({ params }: DayDetailPageProps) {
  const resolvedParams = await params;
  if (!resolvedParams || typeof resolvedParams.date !== 'string' || resolvedParams.date.length === 0) {
    notFound();
  }
  const date = decodeURIComponent(resolvedParams.date);
  if (!isValidDateStr(date)) {
    notFound();
  }
  const formatted = formatFullDate(date);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Back to main page"
        >
          ← Back
        </Link>
      </div>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {formatted}
        </h1>
      </header>

      <section aria-labelledby="daily-summary" className="mt-8 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-black">
        <h2 id="daily-summary" className="mb-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">Daily Summary</h2>
        <DailySummary date={date} sleepQuality={7} exerciseMinutes={0} notes="" />
      </section>

      <section aria-labelledby="timeframe-grid" className="mt-8 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-black">
        <h2 id="timeframe-grid" className="mb-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">Timeframes</h2>
        {/* M3.4 will render TimeframeGrid here; M3.3 will define rows */}
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Per-timeframe entry grid will appear here.</p>
      </section>
    </main>
  );
}