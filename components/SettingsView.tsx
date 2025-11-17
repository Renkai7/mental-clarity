"use client";

import React, { useState } from "react";
import TimeframeList from "./TimeframeList";
import TimeframeEditor from "./TimeframeEditor";
import GoalsConfig, { Goals } from "./GoalsConfig";
import PreferencesConfig, { Preferences } from "./PreferencesConfig";
import CIConfig from "./CIConfig";
import DataManagement from "./DataManagement";

interface BlockConfig {
  id: string;
  label: string;
  start: string;
  end: string;
  order: number;
  active: boolean;
}

interface CISettings {
  alphaR: number; alphaC: number; alphaA: number; alphaAnx: number; alphaStr: number;
  maxR: number; maxC: number; maxA: number; greenMin: number; yellowMin: number;
}

const initialBlocks: BlockConfig[] = [
  { id: 'wake', label: 'Wake – 9 AM', start: '06:00', end: '09:00', order: 0, active: true },
  { id: 'morning', label: '9 AM – 12 PM', start: '09:00', end: '12:00', order: 1, active: true },
  { id: 'midday', label: '12 PM – 3 PM', start: '12:00', end: '15:00', order: 2, active: true },
  { id: 'afternoon', label: '3 PM – 6 PM', start: '15:00', end: '18:00', order: 3, active: true },
  { id: 'evening', label: '6 PM – 9 PM', start: '18:00', end: '21:00', order: 4, active: true },
  { id: 'late', label: '9 PM – Midnight', start: '21:00', end: '24:00', order: 5, active: true },
];

const defaultGoals: Goals = {
  R: 50,
  C: 30,
  A: 20,
  exerciseMinutes: 30,
  minSleepQuality: 7,
};

const defaultPreferences: Preferences = {
  defaultTab: 'R',
  heatmapMetric: 'CI',
};

const defaultCISettings: CISettings = {
  alphaR: 0.30,
  alphaC: 0.25,
  alphaA: 0.20,
  alphaAnx: 0.15,
  alphaStr: 0.10,
  maxR: 50,
  maxC: 30,
  maxA: 20,
  greenMin: 0.66,
  yellowMin: 0.33,
};

export const SettingsView: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockConfig[]>(initialBlocks);
  const [editing, setEditing] = useState<BlockConfig | undefined>();
  const [showEditor, setShowEditor] = useState(false);
  const [goals, setGoals] = useState<Goals>(defaultGoals);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [ciSettings, setCISettings] = useState<CISettings>(defaultCISettings);

  function handleAdd() {
    setEditing(undefined);
    setShowEditor(true);
  }
  function handleEdit(block: BlockConfig) {
    setEditing(block);
    setShowEditor(true);
  }
  function handleDelete(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId).map((b, i) => ({ ...b, order: i })));
  }
  function handleReorder(from: number, to: number) {
    if (to < 0 || to >= blocks.length) return;
    setBlocks((prev) => {
      const copy = [...prev].sort((a, b) => a.order - b.order);
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy.map((b, i) => ({ ...b, order: i }));
    });
  }
  function handleSaveBlock(newBlock: BlockConfig) {
    setBlocks((prev) => {
      const exists = prev.find((b) => b.id === newBlock.id);
      if (exists) {
        return prev.map((b) => (b.id === newBlock.id ? newBlock : b)).sort((a, b) => a.order - b.order);
      }
      return [...prev, newBlock].sort((a, b) => a.order - b.order);
    });
    setShowEditor(false);
  }

  return (
    <div className="mt-8 space-y-12" aria-label="Settings sections">
      {/* Timeframes */}
      <section aria-labelledby="timeframes-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="timeframes-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Timeframes
          </h2>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-500"
          >
            Add Timeframe
          </button>
        </div>
        <TimeframeList blocks={blocks} onEdit={handleEdit} onDelete={handleDelete} onReorder={handleReorder} />
      </section>
      {/* Goals */}
      <section aria-labelledby="goals-heading" className="space-y-4">
        <h2 id="goals-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Goals</h2>
        <GoalsConfig goals={goals} onSave={(g) => setGoals(g)} />
      </section>
      {/* Preferences */}
      <section aria-labelledby="prefs-heading" className="space-y-4">
        <h2 id="prefs-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Preferences</h2>
        <PreferencesConfig preferences={preferences} onSave={(p) => setPreferences(p)} />
      </section>
      {/* CI Advanced */}
      <section aria-labelledby="ci-heading" className="space-y-4">
        <h2 id="ci-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Clarity Index</h2>
        <CIConfig ciSettings={ciSettings} onSave={(s) => setCISettings(s)} />
      </section>
      {/* Data Management */}
      <section aria-labelledby="data-heading" className="space-y-4">
        <h2 id="data-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Data</h2>
        <DataManagement
          onExportJSON={() => console.log('Export JSON placeholder')}
          onExportCSV={() => console.log('Export CSV placeholder')}
          onImportJSON={(file, mode) => console.log('Import JSON placeholder', file.name, mode)}
          onClearAll={() => {
            console.log('Clear all data placeholder');
            // Reset local mock state
            setBlocks([]);
            setGoals(defaultGoals);
            setPreferences(defaultPreferences);
            setCISettings(defaultCISettings);
          }}
        />
      </section>
      {showEditor && (
        <TimeframeEditor
          block={editing}
          existingBlocks={blocks}
          onSave={handleSaveBlock}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default SettingsView;
