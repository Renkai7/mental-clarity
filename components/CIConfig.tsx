"use client";

import React, { useEffect, useState } from "react";

interface CISettings {
  alphaR: number;
  alphaC: number;
  alphaA: number;
  alphaAnx: number;
  alphaStr: number;
  maxR: number;
  maxC: number;
  maxA: number;
  greenMin: number; // CI >= greenMin => green
  yellowMin: number; // CI >= yellowMin => yellow else red
}

export interface CIConfigProps {
  ciSettings: CISettings;
  onSave: (settings: CISettings) => void;
  disabled?: boolean;
}

const DEFAULTS: CISettings = {
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

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export const CIConfig: React.FC<CIConfigProps> = ({ ciSettings, onSave, disabled }) => {
  const [local, setLocal] = useState<CISettings>(ciSettings);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    // Revalidate whenever settings change after touch
    if (!touched) return;
    setErrors(validate(local));
  }, [local, touched]);

  function validate(s: CISettings): Record<string, string> {
    const e: Record<string, string> = {};
    const weightSum = s.alphaR + s.alphaC + s.alphaA + s.alphaAnx + s.alphaStr;
    if (Math.abs(weightSum - 1) > 0.0001) e.weights = `Weights should sum to 1 (current ${weightSum.toFixed(2)})`;
    if (s.maxR <= 0) e.maxR = "Max R must be > 0";
    if (s.maxC <= 0) e.maxC = "Max C must be > 0";
    if (s.maxA <= 0) e.maxA = "Max A must be > 0";
    if (s.greenMin <= s.yellowMin) e.greenMin = "Green threshold must be > Yellow";
    if (s.greenMin < 0 || s.greenMin > 1) e.greenMin = "Green threshold 0–1";
    if (s.yellowMin < 0 || s.yellowMin > 1) e.yellowMin = "Yellow threshold 0–1";
    return e;
  }

  function handleNumeric<K extends keyof CISettings>(key: K, value: number) {
    setTouched(true);
    setLocal((prev) => ({ ...prev, [key]: value }));
  }

  function handleSlider<K extends keyof CISettings>(key: K, value: string) {
    handleNumeric(key, parseFloat(value));
  }

  function resetDefaults() {
    setTouched(true);
    setLocal(DEFAULTS);
    setErrors(validate(DEFAULTS));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate(local);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    onSave(local);
  }

  const saveDisabled = disabled || (touched && Object.keys(errors).length > 0);

  function ciColor(ci: number): string {
    if (ci >= local.greenMin) return "bg-[var(--clarity-high)]";
    if (ci >= local.yellowMin) return "bg-[var(--clarity-medium)]";
    return "bg-[var(--clarity-low)]";
  }

  return (
    <div className="border border-zinc-200 rounded-md dark:border-zinc-700" aria-labelledby="ci-config-heading">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        aria-expanded={open}
        id="ci-config-heading"
      >
        <span>Advanced: Clarity Index Tuning</span>
        <span className="text-xs opacity-70">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-zinc-200 dark:border-zinc-700">
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Clarity Index configuration">
            <div className="space-y-2">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Adjust contribution weights (should total 1) and normalization caps.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  { key: 'alphaR', label: 'Rumination Weight' },
                  { key: 'alphaC', label: 'Compulsions Weight' },
                  { key: 'alphaA', label: 'Avoidance Weight' },
                  { key: 'alphaAnx', label: 'Anxiety Weight' },
                  { key: 'alphaStr', label: 'Stress Weight' },
                ] as const).map((item) => (
                  <div key={item.key} className="space-y-1">
                    <label htmlFor={item.key} className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">{item.label}</label>
                    <input
                      id={item.key}
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={local[item.key]}
                      disabled={disabled}
                      onChange={(e) => handleSlider(item.key, e.target.value)}
                      className="w-full"
                      aria-valuenow={local[item.key]}
                      aria-valuemin={0}
                      aria-valuemax={1}
                    />
                    <div className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                      <span>{local[item.key].toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleNumeric(item.key, DEFAULTS[item.key])}
                        disabled={disabled}
                        className="text-indigo-600 hover:underline disabled:opacity-40"
                      >
                        Default
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {errors.weights && (
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">{errors.weights}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="maxR" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Max Rumination</label>
                <input
                  id="maxR"
                  type="number"
                  min={1}
                  value={local.maxR}
                  disabled={disabled}
                  onChange={(e) => handleNumeric('maxR', clamp(Number(e.target.value), 1, 100000))}
                  className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  aria-invalid={!!errors.maxR}
                  aria-describedby={errors.maxR ? 'maxR-error' : undefined}
                />
                {errors.maxR && <p id="maxR-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.maxR}</p>}
              </div>
              <div>
                <label htmlFor="maxC" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Max Compulsions</label>
                <input
                  id="maxC"
                  type="number"
                  min={1}
                  value={local.maxC}
                  disabled={disabled}
                  onChange={(e) => handleNumeric('maxC', clamp(Number(e.target.value), 1, 100000))}
                  className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  aria-invalid={!!errors.maxC}
                  aria-describedby={errors.maxC ? 'maxC-error' : undefined}
                />
                {errors.maxC && <p id="maxC-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.maxC}</p>}
              </div>
              <div>
                <label htmlFor="maxA" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Max Avoidance</label>
                <input
                  id="maxA"
                  type="number"
                  min={1}
                  value={local.maxA}
                  disabled={disabled}
                  onChange={(e) => handleNumeric('maxA', clamp(Number(e.target.value), 1, 100000))}
                  className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  aria-invalid={!!errors.maxA}
                  aria-describedby={errors.maxA ? 'maxA-error' : undefined}
                />
                {errors.maxA && <p id="maxA-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.maxA}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Thresholds</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="greenMin" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Green Min</label>
                  <input
                    id="greenMin"
                    type="number"
                    step={0.01}
                    min={0}
                    max={1}
                    value={local.greenMin}
                    disabled={disabled}
                    onChange={(e) => handleNumeric('greenMin', clamp(Number(e.target.value), 0, 1))}
                    className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    aria-invalid={!!errors.greenMin}
                    aria-describedby={errors.greenMin ? 'greenMin-error' : undefined}
                  />
                  {errors.greenMin && <p id="greenMin-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.greenMin}</p>}
                </div>
                <div>
                  <label htmlFor="yellowMin" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Yellow Min</label>
                  <input
                    id="yellowMin"
                    type="number"
                    step={0.01}
                    min={0}
                    max={1}
                    value={local.yellowMin}
                    disabled={disabled}
                    onChange={(e) => handleNumeric('yellowMin', clamp(Number(e.target.value), 0, 1))}
                    className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    aria-invalid={!!errors.yellowMin}
                    aria-describedby={errors.yellowMin ? 'yellowMin-error' : undefined}
                  />
                  {errors.yellowMin && <p id="yellowMin-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.yellowMin}</p>}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2" aria-label="Preview colors based on thresholds">
                {[0.2, 0.5, 0.8].map((ci) => (
                  <div key={ci} className={`h-8 w-8 rounded ${ciColor(ci)} flex items-center justify-center text-[10px] font-medium text-white`}>
                    {ci}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={resetDefaults}
                disabled={disabled}
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                Reset Defaults
              </button>
              <button
                type="submit"
                disabled={saveDisabled}
                className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-500 disabled:opacity-50"
              >
                Save CI Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CIConfig;
