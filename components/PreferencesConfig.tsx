"use client";

import React, { useEffect, useRef, useState } from "react";

export interface Preferences {
  defaultTab: 'R' | 'C' | 'A';
  heatmapMetric: 'CI' | 'R' | 'C' | 'A';
}

export interface PreferencesConfigProps {
  preferences: Preferences;
  onSave: (prefs: Preferences) => void;
  disabled?: boolean;
}

export const PreferencesConfig: React.FC<PreferencesConfigProps> = ({ preferences, onSave, disabled }) => {
  const [local, setLocal] = useState<Preferences>(preferences);
  const [touched, setTouched] = useState(false);
  const firstRadioRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    firstRadioRef.current?.focus();
  }, []);

  function handleChange<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setTouched(true);
    setLocal(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(local);
  }

  return (
    <form onSubmit={handleSubmit} aria-labelledby="prefs-config-title" className="space-y-5">
      <div>
        <h3 id="prefs-config-title" className="text-sm font-semibold text-white">Preferences</h3>
        <p className="mt-1 text-xs text-slate-400">Set default views and heatmap focus.</p>
      </div>
      <fieldset className="space-y-2" aria-labelledby="default-tab-legend">
        <legend id="default-tab-legend" className="text-xs font-medium text-slate-300">Default Tab</legend>
        <div className="flex flex-wrap gap-3">
          {(['R','C','A'] as const).map((tab, idx) => (
            <label key={tab} className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <input
                ref={idx === 0 ? firstRadioRef : undefined}
                type="radio"
                name="default-tab"
                value={tab}
                checked={local.defaultTab === tab}
                disabled={disabled}
                onChange={() => handleChange('defaultTab', tab)}
                className="h-4 w-4 border-cinematic-800 bg-cinematic-900/60 text-lumina-orange-500 focus:ring-lumina-orange-500"
              />
              {tab === 'R' ? 'Rumination' : tab === 'C' ? 'Compulsions' : 'Avoidance'}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="space-y-2">
        <label htmlFor="heatmap-metric" className="block text-xs font-medium text-slate-300">Heatmap Metric</label>
        <select
          id="heatmap-metric"
          value={local.heatmapMetric}
          disabled={disabled}
          onChange={(e) => handleChange('heatmapMetric', e.target.value as Preferences['heatmapMetric'])}
          className="w-full rounded border border-cinematic-800 bg-cinematic-900/60 px-2 py-1 text-sm text-white focus:outline-none focus:border-lumina-orange-500 focus:shadow-glow-orange"
        >
          <option value="CI">Clarity Index</option>
          <option value="R">Rumination</option>
          <option value="C">Compulsions</option>
          <option value="A">Avoidance</option>
        </select>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="rounded bg-lumina-orange-500 px-4 py-2 text-sm font-medium text-white shadow-glow-orange hover:bg-lumina-orange-600 focus:outline-none focus:shadow-glow-orange-lg disabled:opacity-50"
        >
          Save Preferences
        </button>
      </div>
    </form>
  );
};

export default PreferencesConfig;
