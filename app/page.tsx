"use client";
import { useState, useCallback } from 'react';
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

  return (
    <div className="min-h-screen bg-white dark:bg-black">
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
