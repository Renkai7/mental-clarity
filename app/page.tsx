import MainPageClient from '../components/MainPageClient';

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Mental Clarity Tracker
        </h1>
      </header>
      <MainPageClient />
    </div>
  );
}
