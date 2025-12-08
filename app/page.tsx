"use client";
import { useState, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HomeView from '../components/views/HomeView';
import HistoryViewContainer from '../components/views/HistoryViewContainer';
import StatsViewContainer from '../components/views/StatsViewContainer';
import SettingsViewContainer from '../components/views/SettingsViewContainer';

type AppView = 'home' | 'history' | 'stats' | 'settings';

export default function AppShell() {
  const [view, setView] = useState<AppView>('home');
  const changeView = useCallback((next: AppView) => {
    setView(next);
    console.log('[app] view ->', next);
  }, []);

  // Dev diagnostics: confirm preload injected APIs.
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[app] electronAPI present?', typeof window.electronAPI !== 'undefined');
    // eslint-disable-next-line no-console
    console.log('[app] api present?', typeof window.api !== 'undefined');
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onNavigate={changeView} currentView={view} />
      <div className="pt-2">
        {view === 'home' && <HomeView />}
        {view === 'history' && <HistoryViewContainer />}
        {view === 'stats' && <StatsViewContainer />}
        {view === 'settings' && <SettingsViewContainer />}
      </div>
    </div>
  );
}
