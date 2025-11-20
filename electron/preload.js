const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
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
});
