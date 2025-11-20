'use client';
import SettingsView from '../SettingsView';

export default function SettingsViewContainer() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8" id="main-content">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Settings</h1>
      <SettingsView />
    </main>
  );
}
