const { contextBridge, ipcRenderer } = require('electron');

// Build API object once so we can expose under multiple names for compatibility.
const exposedApi = {
  ping: () => ipcRenderer.invoke('ping'),

  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),

  getBlocks: () => ipcRenderer.invoke('blocks:get'),
  replaceBlocks: (blocks) => ipcRenderer.invoke('blocks:replace', blocks),

  getEntriesForDate: (date) => ipcRenderer.invoke('entries:getForDate', date),
  getEntriesSummary: (metric, limit) => ipcRenderer.invoke('entries:summary', metric, limit),
  getEntry: (date, blockId) => ipcRenderer.invoke('entry:get', date, blockId),
  upsertEntry: (entry) => ipcRenderer.invoke('entry:upsert', entry),

  getDailyMeta: (date) => ipcRenderer.invoke('dailyMeta:get', date),
  upsertDailyMeta: (meta) => ipcRenderer.invoke('dailyMeta:upsert', meta),

  createEmptyDay: (date) => ipcRenderer.invoke('day:createEmpty', date),
};

try {
  contextBridge.exposeInMainWorld('api', exposedApi);
  contextBridge.exposeInMainWorld('electronAPI', exposedApi); // alias for clarity; renderer can check either
  // Lightweight dev log so we can confirm preload ran.
  // eslint-disable-next-line no-console
  console.log('[preload] API exposed (api & electronAPI) keys:', Object.keys(exposedApi));
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('[preload] contextBridge expose failed', err);
}
