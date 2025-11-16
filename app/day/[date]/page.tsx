interface DayDetailPageProps {
  params: { date: string };
}

export default function DayDetailPage({ params }: DayDetailPageProps) {
  const { date } = params;
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Day Detail: {date}
      </h1>
      <section aria-label="day-detail" className="mt-6" />
    </main>
  );
}