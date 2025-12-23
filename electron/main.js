const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { init, seedIfNeeded, migrateDefaults, getSettings, updateSettings, getBlocks, getEntriesForDate, getEntry, upsertEntry, getDailyMeta, upsertDailyMeta, createEmptyDay, replaceBlocks, getEntriesSummary } = require('../db/sqlite');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configure logging for updates
log.transports.file.level = 'info';
autoUpdater.logger = log;

let mainWindow;

let prodMode = false;

// Auto-updater configuration
autoUpdater.autoDownload = false; // Don't auto-download, ask user first
autoUpdater.autoInstallOnAppQuit = true;

// Configure for private repository (if needed)
// This uses the GitHub releases API directly instead of the .atom feed
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'Renkai7',
  repo: 'mental-clarity',
  private: true, // Set to true for private repos
});

// Update event handlers
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version);
  
  // Notify renderer process
  if (mainWindow) {
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseDate: info.releaseDate
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info.version);
});

autoUpdater.on('error', (err) => {
  log.error('Update error:', err);
  if (mainWindow) {
    // Provide user-friendly error messages
    let friendlyMessage = err.message;
    
    // Handle 404 - No releases available
    if (err.message && err.message.includes('404')) {
      friendlyMessage = 'No releases found. This is the first version.';
    }
    // Handle network errors
    else if (err.message && (err.message.includes('ENOTFOUND') || err.message.includes('ETIMEDOUT'))) {
      friendlyMessage = 'Unable to connect to update server. Check your internet connection.';
    }
    // Handle other HTTP errors
    else if (err.message && err.message.includes('HttpError')) {
      friendlyMessage = 'Update server temporarily unavailable. Try again later.';
    }
    
    mainWindow.webContents.send('update-error', friendlyMessage);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  log.info(`Download progress: ${progressObj.percent}%`);
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', {
      version: info.version
    });
  }
});
// Production uses static exported files (Next.js output: 'export').
// No Next.js server or child process is started at runtime.
function createWindow() {
  const isPackaged = app.isPackaged;
  // Check if out/index.html exists to determine if we should use production build
  const outIndexPath = path.join(__dirname, '..', 'out', 'index.html');
  const hasProductionBuild = fs.existsSync(outIndexPath);
  const isDev = !isPackaged && !hasProductionBuild;
  
  const preloadPath = path.join(__dirname, 'preload.js');
  const iconPath = path.join(__dirname, '..', 'mental-clarity-icon.png');
  
  // Calculate window size based on screen dimensions
  const { workArea } = screen.getPrimaryDisplay();
  const targetWidth = Math.round(workArea.width / 3);
  const targetHeight = Math.round(workArea.height * 0.90);
  
  console.log('[main] creating window. mode=', isDev ? 'dev' : 'prod', 'preload=', preloadPath);
  console.log('[main] isPackaged:', isPackaged, 'hasProductionBuild:', hasProductionBuild);
  console.log('[main] window size:', targetWidth, 'x', targetHeight, '(workArea:', workArea.width, 'x', workArea.height, ')');
  
  mainWindow = new BrowserWindow({
    width: targetWidth,
    height: targetHeight,
    minWidth: 800,
    minHeight: 600,
    show: true,
    icon: iconPath,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      preload: preloadPath,
    },
  });
  
  if (isDev) {
    const devURL = process.env.RENDERER_URL || 'http://localhost:3000';
    console.log('[main] loading dev URL', devURL);
    mainWindow.loadURL(devURL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    prodMode = true;
    const indexFile = outIndexPath;
    console.log('[main] loading prod file', indexFile);
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
    e.preventDefault();
    console.log('[navigation] Intercepted:', url);
    
    if (isDev) {
      // Allow normal HTTP navigation in dev mode
      const isSameOrigin = url.startsWith(process.env.RENDERER_URL || 'http://localhost:3000');
      if (isSameOrigin) {
        e.preventDefault();
        mainWindow.loadURL(url);
      } else {
        console.warn('[security] Blocked navigation to', url);
      }
    } else {
      // In production, intercept file:// navigations and convert to loadFile
      if (url.startsWith('file://')) {
        const urlObj = new URL(url);
        let pathname = urlObj.pathname;
        
        // On Windows, pathname will be like "/C:/day/2025-11-29/"
        // We need to extract just "/day/2025-11-29/" part
        if (process.platform === 'win32') {
          // Remove leading slash and drive letter (e.g., "/C:/day/" -> "/day/")
          pathname = pathname.replace(/^\/[a-zA-Z]:/, '');
        }
        
        // Check if this is a valid route in our out folder
        const outDir = path.join(__dirname, '..', 'out');
        let targetPath;
        
        // Convert URL path to file path (e.g., /day/2025-11-29/ -> day/2025-11-29/index.html)
        if (pathname === '/' || pathname === '') {
          targetPath = path.join(outDir, 'index.html');
        } else {
          // Remove leading/trailing slashes and build path
          const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
          targetPath = path.join(outDir, cleanPath, 'index.html');
        }
        
        console.log('[navigation] Attempting to load:', targetPath);
        
        if (fs.existsSync(targetPath)) {
          mainWindow.loadFile(targetPath);
        } else {
          console.error('[navigation] File not found:', targetPath);
          // Load 404 page
          const notFoundPath = path.join(outDir, '_not-found', 'index.html');
          if (fs.existsSync(notFoundPath)) {
            mainWindow.loadFile(notFoundPath);
          }
        }
      } else {
        console.warn('[security] Blocked navigation to', url);
      }
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
  const isDev = !app.isPackaged;
  console.log('[main] app.whenReady mode=', isDev ? 'dev' : 'prod');
  const dbName = isDev ? 'mental-clarity-dev.db' : 'mental-clarity.db';
  const dbFile = path.join(app.getPath('userData'), dbName);
  console.log('[main] isDev:', isDev);
  console.log('[main] dbFile:', dbFile);
  console.log('[main] DB init starting path=', dbFile);
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
  console.log('[main] IPC handlers registered');
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

  // Get app version
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // IPC handlers for update actions
  ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) {
      return { available: false, isDev: true };
    }
    
    try {
      const result = await autoUpdater.checkForUpdates();
      return { available: true, updateInfo: result.updateInfo };
    } catch (error) {
      log.error('Check for updates failed:', error);
      
      // Provide user-friendly error messages
      let friendlyMessage = error.message;
      
      // Handle 404 - No releases available
      if (error.message && error.message.includes('404')) {
        friendlyMessage = 'No releases found. This is the first version.';
      }
      // Handle network errors
      else if (error.message && (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT'))) {
        friendlyMessage = 'Unable to connect to update server. Check your internet connection.';
      }
      // Handle other HTTP errors
      else if (error.message && error.message.includes('HttpError')) {
        friendlyMessage = 'Update server temporarily unavailable. Try again later.';
      }
      
      return { available: false, error: friendlyMessage };
    }
  });

  ipcMain.handle('download-update', async () => {
    if (!app.isPackaged) {
      return { success: false, isDev: true };
    }
    
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      log.error('Download update failed:', error);
      
      // Provide user-friendly error messages
      let friendlyMessage = error.message;
      
      // Handle 404 - No releases available
      if (error.message && error.message.includes('404')) {
        friendlyMessage = 'Update download failed. Please try checking for updates again.';
      }
      // Handle network errors
      else if (error.message && (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT'))) {
        friendlyMessage = 'Unable to connect to update server. Check your internet connection.';
      }
      // Handle other HTTP errors
      else if (error.message && error.message.includes('HttpError')) {
        friendlyMessage = 'Update server temporarily unavailable. Try again later.';
      }
      
      return { success: false, error: friendlyMessage };
    }
  });

  ipcMain.handle('install-update', () => {
    if (!app.isPackaged) {
      return { success: false, isDev: true };
    }
    
    autoUpdater.quitAndInstall();
    return { success: true };
  });

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
  // Range queries (M11)
  ipcMain.handle('entries:range', async (_e, startDate, endDate) => {
    return require('../db/sqlite.js').getEntriesRange(String(startDate), String(endDate));
  });
  ipcMain.handle('dailyMeta:range', async (_e, startDate, endDate) => {
    return require('../db/sqlite.js').getDailyMetaRange(String(startDate), String(endDate));
  });
  console.log('[main] registerIpcHandlers complete');
}

module.exports = { createWindow };
