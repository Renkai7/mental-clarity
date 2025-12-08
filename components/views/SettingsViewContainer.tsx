'use client';
import { useEffect } from 'react';
import SettingsView from '../SettingsView';
import { EmberShell } from '@/ui/cinematic-ember';

export default function SettingsViewContainer() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <EmberShell className="max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-white">Settings</h1>
      <SettingsView />
    </EmberShell>
  );
}
