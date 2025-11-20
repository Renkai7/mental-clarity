import Link from 'next/link';
import { notFound } from 'next/navigation';
import DayDetailForm from '../../../components/DayDetailForm';

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

      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {formatted}
        </h1>
      </header>

      <DayDetailForm date={date} />
    </main>
  );
}

// Static export support: enumerate a limited recent set of dates so Next can
// pre-render the dynamic route under output: 'export'. This avoids build
// failure while keeping pages accessible offline. Adjust range as needed.
export function generateStaticParams() {
  const today = new Date();
  const out: { date: string }[] = [];
  for (let i = 0; i < 30; i++) {
    const dt = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dt.getUTCDate()).padStart(2, '0');
    out.push({ date: `${y}-${m}-${d}` });
  }
  return out;
}