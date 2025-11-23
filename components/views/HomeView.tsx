'use client';
import MainPageClient from '../MainPageClient';

export default function HomeView() {
  return (
    <div className="mx-auto w-full max-w-7xl xl:max-w-none px-6 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Mental Clarity Tracker</h1>
      </header>
      <MainPageClient />
    </div>
  );
}
