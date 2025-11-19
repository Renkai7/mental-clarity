const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { init, seedIfNeeded, migrateDefaults, getSettings, updateSettings, getBlocks, getEntriesForDate, getEntry, upsertEntry, getDailyMeta, upsertDailyMeta, createEmptyDay, replaceBlocks, getEntriesSummary } = require('../db/sqlite');

let mainWindow;

function createWindow() {
  const isDev = !app.isPackaged;
  const preloadPath = path.join(__dirname, 'preload.js');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
      preload: preloadPath,
    },
  });

  const devURL = process.env.RENDERER_URL || 'http://localhost:3000';
  const urlToLoad = isDev ? devURL : devURL;
  mainWindow.loadURL(urlToLoad);

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(async () => {
  const dbFile = path.join(app.getPath('userData'), 'mental-clarity.db');
  await init(dbFile);
  seedIfNeeded();
  migrateDefaults();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function registerIpcHandlers() {
  ipcMain.handle('ping', () => 'pong');

  ipcMain.handle('settings:get', async () => {
    return getSettings();
  });
  ipcMain.handle('settings:update', async (_e, settings) => {
    return updateSettings(settings);
  });

  ipcMain.handle('blocks:get', async () => {
    return getBlocks();
  });
  ipcMain.handle('blocks:replace', async (_e, blocks) => {
    return replaceBlocks(blocks);
  });

  ipcMain.handle('entries:getForDate', async (_e, date) => {
    return getEntriesForDate(String(date));
  });
  ipcMain.handle('entries:summary', async (_e, metric, limit) => {
    return getEntriesSummary(String(metric), Number(limit || 30));
  });
  ipcMain.handle('entry:get', async (_e, date, blockId) => {
    return getEntry(String(date), String(blockId));
  });
  ipcMain.handle('entry:upsert', async (_e, entry) => {
    try {
      return upsertEntry(entry);
    } catch (err) {
      console.error('[ipc] upsertEntry failed', err);
      const msg = err && err.message ? err.message : String(err);
      throw new Error(`upsertEntry failed: ${msg}`);
    }
  });

  ipcMain.handle('dailyMeta:get', async (_e, date) => {
    return getDailyMeta(String(date));
  });
  ipcMain.handle('dailyMeta:upsert', async (_e, meta) => {
    return upsertDailyMeta(meta);
  });

  ipcMain.handle('day:createEmpty', async (_e, date) => {
    return createEmptyDay(String(date));
  });
}

module.exports = { createWindow };
