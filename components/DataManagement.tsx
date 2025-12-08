"use client";

import React, { useState } from "react";

interface DataManagementProps {
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onImportJSON?: (file: File, mode: 'merge' | 'replace') => void;
  onClearAll?: () => void;
  disabled?: boolean;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  onExportJSON,
  onExportCSV,
  onImportJSON,
  onClearAll,
  disabled,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importing, setImporting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onImportJSON) return;
    setImporting(true);
    // Placeholder action: just invoke callback; real implementation in M12
    onImportJSON(file, importMode);
    setTimeout(() => setImporting(false), 600);
  }

  return (
    <div className="space-y-4" aria-labelledby="data-mgmt-title">
      <h3 id="data-mgmt-title" className="text-sm font-semibold text-white">
        Data Management
      </h3>
      <p className="text-xs text-slate-400">
        Export your data for backup, import a previous snapshot, or clear everything. All data stays local on this device.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
            onClick={onExportJSON}
          disabled={disabled}
          className="rounded border border-cinematic-800 bg-cinematic-900/60 px-3 py-2 text-sm font-medium text-white hover:bg-cinematic-800/60 hover:shadow-glow-orange-sm focus:outline-none focus:shadow-glow-orange"
        >
          Export JSON (Placeholder)
        </button>
        <button
          type="button"
          onClick={onExportCSV}
          disabled={disabled}
          className="rounded border border-cinematic-800 bg-cinematic-900/60 px-3 py-2 text-sm font-medium text-white hover:bg-cinematic-800/60 hover:shadow-glow-orange-sm focus:outline-none focus:shadow-glow-orange"
        >
          Export CSV (Placeholder)
        </button>
      </div>
      <div className="space-y-2">
        <label htmlFor="import-mode" className="block text-xs font-medium text-slate-300">
          Import Mode
        </label>
        <select
          id="import-mode"
          value={importMode}
          onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
          disabled={disabled || importing}
          className="w-full rounded border border-cinematic-800 bg-cinematic-900/60 px-2 py-1 text-sm text-white focus:outline-none focus:border-lumina-orange-500 focus:shadow-glow-orange"
        >
          <option value="merge">Merge (keep existing, add/update new)</option>
          <option value="replace">Replace (wipe then import)</option>
        </select>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            disabled={disabled || importing}
            className="text-xs file:mr-2 file:rounded file:border file:border-zinc-300 file:bg-zinc-50 file:px-2 file:py-1 file:text-xs file:font-medium hover:file:bg-zinc-100 dark:file:border-zinc-600 dark:file:bg-zinc-700 dark:file:text-zinc-100"
            aria-label="Import JSON file"
          />
          {importing && <span className="text-xs text-slate-400">Importing...</span>}
        </div>
      </div>
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={disabled}
          className="rounded border border-red-500/30 bg-red-500/20 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30 focus:outline-none focus:shadow-glow-orange disabled:opacity-50"
        >
          Clear All Data
        </button>
        <p className="mt-1 text-[11px] text-red-400">Irreversible. Export first if you may need it.</p>
      </div>
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-sm rounded border border-cinematic-800 bg-cinematic-950/95 p-5 shadow-glow-orange backdrop-blur-xl">
            <h4 id="clear-dialog-title" className="text-sm font-semibold text-white">
              Confirm Data Clear
            </h4>
            <p className="mt-2 text-xs text-slate-400">
              This will remove all local entries, settings, and history. There is no undo.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded border border-cinematic-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-cinematic-800/60 focus:outline-none focus:shadow-glow-orange"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll?.();
                  setConfirmOpen(false);
                }}
                className="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white shadow-glow-orange hover:bg-red-600 focus:outline-none focus:shadow-glow-orange-lg"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;
