import SettingsView from "../../components/SettingsView";

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12" id="main-content">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Settings</h1>
      <SettingsView />
    </main>
  );
}