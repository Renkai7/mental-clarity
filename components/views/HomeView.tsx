'use client';
import MainPageClient from '../MainPageClient';
import { EmberShell, BackgroundEffects } from '@/ui/cinematic-ember';

export default function HomeView() {
  return (
    <EmberShell>
      <BackgroundEffects />
      <header className="mb-6">
        <h1 className="text-6xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-lumina-orange-400 bg-clip-text text-transparent">Mental Clarity Tracker</h1>
      </header>
      <MainPageClient />
    </EmberShell>
  );
}
