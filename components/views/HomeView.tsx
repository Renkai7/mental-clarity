'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { EmberShell, BackgroundEffects } from '@/ui/cinematic-ember';

export default function HomeView() {
  const router = useRouter();

  // Automatically redirect to today's date when HomeView loads
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    router.push(`/day/${encodeURIComponent(today)}`);
  }, [router]);

  // Show loading state while redirecting
  return (
    <EmberShell>
      <BackgroundEffects />
      <header className="mb-6">
        <h1 className="text-6xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-lumina-orange-400 bg-clip-text text-transparent">Mental Clarity Tracker</h1>
      </header>
      <div className="flex items-center justify-center py-12">
        <p className="text-lg text-slate-400 animate-pulse">Loading today&apos;s entry...</p>
      </div>
    </EmberShell>
  );
}
