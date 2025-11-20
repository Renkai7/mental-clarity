const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { init, seedIfNeeded, migrateDefaults, getSettings, updateSettings, getBlocks, getEntriesForDate, getEntry, upsertEntry, getDailyMeta, upsertDailyMeta, createEmptyDay, replaceBlocks, getEntriesSummary } = require('../db/sqlite');

let mainWindow;

let prodMode = false;
// Production uses static exported files (Next.js output: 'export').
// No Next.js server or child process is started at runtime.
function createWindow() {
  const isDev = !app.isPackaged;
  const preloadPath = path.join(__dirname, 'preload.js');
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    show: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      preload: preloadPath,
    },
  });
  
  if (isDev) {
    const devURL = process.env.RENDERER_URL || 'http://localhost:3000';
    mainWindow.loadURL(devURL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    prodMode = true;
    const indexFile = path.join(__dirname, '..', 'out', 'index.html');
    try {
      mainWindow.loadFile(indexFile);
    } catch (err) {
      console.error('[main] loadFile failed', err);
      showFatal(err);
    }
  }

  // Prevent new windows / external navigation.
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (e, url) => {
    // Block attempts to navigate away from the local file origin.
    const isLocal = url.startsWith('file://');
    if (!isLocal) {
      e.preventDefault();
      console.warn('[security] Blocked navigation to', url);
    }
  });
}

// (Removed legacy path mutation helpers; PATH adjustments are build-time only.)


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
  console.log('[main] DB init starting', dbFile);
  try {
    await init(dbFile);
    console.log('[main] DB init complete');
    seedIfNeeded();
    console.log('[main] seedIfNeeded complete');
    migrateDefaults();
    console.log('[main] migrateDefaults complete');
  } catch (err) {
    console.error('[main] DB init failure FULL', err, err?.stack);
    showFatal(err);
    return; // abort further startup
  }
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// No server to tear down in static production mode.

function showFatal(err) {
  const msg = err && err.message ? err.message : String(err);
  dialog.showErrorBox('Startup Failure', msg);
  if (mainWindow) mainWindow.loadURL('data:text/plain,Startup failure: ' + encodeURIComponent(msg));
}

process.on('uncaughtException', (err) => {
  console.error('[main] uncaughtException FULL', err, err?.stack);
  if (prodMode) showFatal(err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[main] unhandledRejection FULL', reason, reason instanceof Error ? reason.stack : undefined);
  if (prodMode) showFatal(reason instanceof Error ? reason : new Error(String(reason)));
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
      // Basic input validation & sanitization
      const num = (v, def = 0) => {
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 ? n : def;
      };
      entry.ruminationCount = num(entry.ruminationCount);
      entry.compulsionsCount = num(entry.compulsionsCount);
      entry.avoidanceCount = num(entry.avoidanceCount);
      entry.anxietyScore = num(entry.anxietyScore, 5);
      entry.stressScore = num(entry.stressScore, 5);
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
    const num = (v, def = 0) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? n : def;
    };
    meta.sleepQuality = num(meta.sleepQuality);
    meta.exerciseMinutes = num(meta.exerciseMinutes);
    return upsertDailyMeta(meta);
  });

  ipcMain.handle('day:createEmpty', async (_e, date) => {
    return createEmptyDay(String(date));
  });
}

module.exports = { createWindow };
