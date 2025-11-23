// Thin adapter that proxies data calls to Electron preload API.
// Keeps existing UI code unchanged by exposing familiar functions.

type Api = typeof window & { api?: any };

async function waitForApi(maxWaitMs = 1500, intervalMs = 50) {
  const w = window as Api;
  const start = Date.now();
  // In Electron, userAgent usually contains 'Electron'
  const ua = navigator?.userAgent ?? '';
  const likelyElectron = /Electron/i.test(ua);
  while (!w.api && Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  if (!w.api) {
    const hint = likelyElectron ? 'Preload not injected yet. Try reloading the window.' : 'Are you running via Electron?';
    throw new Error(`Electron API unavailable. ${hint}`);
  }
  return w.api;
}

export async function getSettings() {
  const api = await waitForApi();
  return api.getSettings();
}

export async function updateSettings(settings: any) {
  const api = await waitForApi();
  return api.updateSettings(settings);
}

export async function getBlocks() {
  const api = await waitForApi();
  return api.getBlocks();
}

export async function getEntriesForDate(date: string) {
  const api = await waitForApi();
  return api.getEntriesForDate(date);
}

export async function getEntriesSummary(metric: 'R' | 'C' | 'A', limit: number) {
  const api = await waitForApi();
  return api.getEntriesSummary(metric, limit);
}

export async function getEntriesRange(startDate: string, endDate: string) {
  const api = await waitForApi();
  return api.invoke ? api.invoke('entries:range', startDate, endDate) : api['entries:range'](startDate, endDate);
}

export async function getDailyMetaRange(startDate: string, endDate: string) {
  const api = await waitForApi();
  return api.invoke ? api.invoke('dailyMeta:range', startDate, endDate) : api['dailyMeta:range'](startDate, endDate);
}

export async function upsertEntry(entry: any) {
  const api = await waitForApi();
  return api.upsertEntry(entry);
}

export async function getDailyMeta(date: string) {
  const api = await waitForApi();
  return api.getDailyMeta(date);
}

export async function upsertDailyMeta(meta: any) {
  const api = await waitForApi();
  return api.upsertDailyMeta(meta);
}

export async function createEmptyDay(date: string) {
  const api = await waitForApi();
  return api.createEmptyDay(date);
}
