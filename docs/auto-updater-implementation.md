# Auto-Updater Implementation Guide

**Status**: Not Started  
**Priority**: High  
**Estimated Time**: 2-3 hours  
**Target**: Enable seamless automatic updates for the Electron desktop app

---

## Overview

Implement `electron-updater` to provide automatic update functionality for Mental Clarity desktop application. Users will receive notifications when updates are available and can install them with one click, without losing data or having to manually download/reinstall.

---

## Prerequisites

- [ ] Verify `electron-builder` is installed (should already be present)
- [ ] Confirm GitHub repository access (Renkai7/mental-clarity)
- [ ] Ensure we have a versioning strategy (semantic versioning in package.json)

---

## Step 1: Install electron-updater ✅

**Task**: Add electron-updater dependency

```bash
npm install electron-updater --save
```

**Verification**:
- [x] Check `package.json` has `"electron-updater": "^6.6.2"` in dependencies
- [x] Run `npm list electron-updater` to confirm installation
- [x] All tests passing (67/67)

---

## ✅ Step 2: Configure electron-builder for Publishing

**Task**: Update `package.json` to configure publishing to GitHub Releases

**File**: `package.json`

Add or update the `build` section:

```json
{
  "build": {
    "appId": "com.mentalclarity.app",
    "productName": "Mental Clarity",
    "publish": {
      "provider": "github",
      "owner": "Renkai7",
      "repo": "mental-clarity"
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.healthcare-fitness"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Utility"
    }
  }
}
```

**Verification**:
- [x] `package.json` has `build.publish` configured
- [x] All platform targets are specified
- [x] Tests passing (67/67)

---

## Step 3: Implement Auto-Update Logic in Main Process ✅

**Task**: Add update checking and notification logic to `electron/main.js`

**File**: `electron/main.js`

### 3.1: Add imports at the top

```javascript
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configure logging for updates
log.transports.file.level = 'info';
autoUpdater.logger = log;
```

### 3.2: Configure auto-updater

Add after imports, before `app.whenReady()`:

```javascript
// Auto-updater configuration
autoUpdater.autoDownload = false; // Don't auto-download, ask user first
autoUpdater.autoInstallOnAppQuit = true;

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
    mainWindow.webContents.send('update-error', err.message);
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
```

### 3.3: Add IPC handlers for update actions

Add before `app.whenReady()`:

```javascript
const { ipcMain } = require('electron'); // Update existing import

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
    return { available: false, error: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    log.error('Download update failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});
```

### 3.4: Check for updates on app launch

Inside `app.whenReady()`, after window creation:

```javascript
app.whenReady().then(() => {
  // ... existing window creation code ...
  
  // Check for updates after app is ready (only in production)
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 3000); // Wait 3 seconds after launch
  }
  
  // ... rest of code ...
});
```

**Verification**:
- [ ] All imports added
- [ ] Event handlers configured
- [ ] IPC handlers registered
- [ ] Auto-check on launch implemented
- [ ] Proper dev/prod environment handling

---

## Step 4: Update Preload Script ✅

**Task**: Expose update APIs to renderer process

**File**: `electron/preload.js`

Add to the `contextBridge.exposeInMainWorld` API:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing APIs ...
  
  // Update APIs
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('update-available');
  },
  
  onUpdateDownloadProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('update-download-progress');
  },
  
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('update-downloaded');
  },
  
  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', (_, message) => callback(message));
    return () => ipcRenderer.removeAllListeners('update-error');
  }
});
```

**Verification**:
- [x] electron-updater imported and configured
- [x] Logging enabled with electron-log
- [x] autoDownload=false, autoInstallOnAppQuit=true set
- [x] All 6 event handlers implemented (checking, available, not-available, error, progress, downloaded)
- [x] IPC handlers added (check-for-updates, download-update, install-update)
- [x] All 67 tests passing

---

**Task**: Add TypeScript definitions for update APIs

**File**: `types/preload.d.ts`

Add to the `ElectronAPI` interface:

```typescript
interface ElectronAPI {
  // ... existing types ...
  
  // Update APIs
  checkForUpdates: () => Promise<{
    available: boolean;
    isDev?: boolean;
    updateInfo?: {
      version: string;
      releaseDate: string;
      releaseNotes?: string;
    };
    error?: string;
  }>;
  
  downloadUpdate: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  
  installUpdate: () => void;
  
  onUpdateAvailable: (callback: (data: {
    version: string;
    releaseNotes?: string;
    releaseDate: string;
  }) => void) => () => void;
  
  onUpdateDownloadProgress: (callback: (data: {
    percent: number;
    transferred: number;
    total: number;
  }) => void) => () => void;
  
  onUpdateDownloaded: (callback: (data: {
    version: string;
  }) => void) => () => void;
  
  onUpdateError: (callback: (message: string) => void) => () => void;
}
```

**Verification**:
- [x] Types match preload.js API
- [x] Return types accurately defined
- [x] All 67 tests passing

---

## ✅ Step 5: Create Update Notification Component

**Task**: Build a React component to show update notifications

**File**: `components/UpdateNotification.tsx` (NEW FILE)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

type UpdateState = 'idle' | 'available' | 'downloading' | 'ready' | 'error';

interface UpdateInfo {
  version: string;
  releaseNotes?: string;
  releaseDate: string;
}

export default function UpdateNotification() {
  const [state, setState] = useState<UpdateState>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if running in Electron
    if (typeof window === 'undefined' || !window.electronAPI) {
      return;
    }

    // Listen for update events
    const removeAvailable = window.electronAPI.onUpdateAvailable((data) => {
      setState('available');
      setUpdateInfo(data);
    });

    const removeProgress = window.electronAPI.onUpdateDownloadProgress((data) => {
      setState('downloading');
      setDownloadProgress(data.percent);
    });

    const removeDownloaded = window.electronAPI.onUpdateDownloaded((data) => {
      setState('ready');
      setUpdateInfo(prev => prev ? { ...prev, version: data.version } : null);
    });

    const removeError = window.electronAPI.onUpdateError((message) => {
      setState('error');
      setErrorMessage(message);
    });

    // Cleanup listeners
    return () => {
      removeAvailable();
      removeProgress();
      removeDownloaded();
      removeError();
    };
  }, []);

  const handleDownload = async () => {
    setState('downloading');
    setDownloadProgress(0);
    await window.electronAPI.downloadUpdate();
  };

  const handleInstall = () => {
    window.electronAPI.installUpdate();
  };

  const handleDismiss = () => {
    setState('idle');
    setUpdateInfo(null);
    setErrorMessage('');
  };

  if (state === 'idle') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="p-4 shadow-lg border-2 border-blue-500">
        {state === 'available' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Update Available</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Version {updateInfo?.version} is ready to download
              </p>
              {updateInfo?.releaseNotes && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                  {updateInfo.releaseNotes}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1">
                Download Update
              </Button>
              <Button onClick={handleDismiss} variant="outline">
                Later
              </Button>
            </div>
          </div>
        )}

        {state === 'downloading' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Downloading Update</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {downloadProgress.toFixed(1)}% complete
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {state === 'ready' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Update Ready</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Version {updateInfo?.version} is ready to install
              </p>
              <p className="text-xs text-gray-500 mt-1">
                The app will restart to complete installation
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInstall} className="flex-1">
                Install & Restart
              </Button>
              <Button onClick={handleDismiss} variant="outline">
                Later
              </Button>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-red-600">Update Error</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {errorMessage || 'Failed to check for updates'}
              </p>
            </div>
            <Button onClick={handleDismiss} variant="outline" className="w-full">
              Dismiss
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
```

**Verification**:
- [x] Component created at components/UpdateNotification.tsx
- [x] All update states handled (available, downloading, ready, error)
- [x] Progress indicator implemented with animated bar
- [x] UI matches app design system (Button/Card components, cinematic theme)
- [x] Event listeners properly cleaned up
- [x] All 67 tests passing

---

## ✅ Step 6: Add Update Component to Layout

**Task**: Include UpdateNotification in the main app layout

**File**: `app/layout.tsx`

Added the import and component at the end of body (after Toaster).

**Verification**:
- [x] Component imported from @/components/UpdateNotification
- [x] Component rendered at root level (end of body)
- [x] Positioned after other UI elements to avoid interference
- [x] No TypeScript errors

---

## ✅ Step 7: Add Manual Update Check to Settings

**Task**: Allow users to manually check for updates

**File**: `components/SettingsView.tsx`

Added Updates section with:
- State management for checking status and results
- `handleCheckForUpdates` async function that calls `window.electronAPI.checkForUpdates()`
- Handles all response cases: dev mode, available, error, up-to-date
- UI section with Button, status message, and current version display
- EmberCard variant="amber" for consistent styling
- Positioned after Data Management section

**Verification**:
- [x] Button added to settings (in new "Updates" section)
- [x] Manual check handler implemented with proper error handling
- [x] Feedback shown to user via updateCheckResult state
- [x] Current version displayed (v0.1.0 Desktop App / Web Version)
- [x] No TypeScript errors

---

## ✅ Step 8: Create GitHub Release Workflow

**Task**: Automate building and publishing releases

**File**: `.github/workflows/release.yml` (CREATED)

Created GitHub Actions workflow that:
- Triggers on version tags (v*.*.*)
- Builds on all platforms (Windows, macOS, Ubuntu)
- Uses electron-builder to package the app
- Automatically creates GitHub Releases with artifacts
- Uses GitHub token for authentication

**Key features:**
- Multi-platform matrix build (windows-latest, macos-latest, ubuntu-latest)
- Uploads build artifacts for debugging
- Auto-publishes release with all platform installers
- Permissions: contents: write (required for creating releases)

**Verification**:
- [x] Workflow file created at .github/workflows/release.yml
- [x] Multi-platform builds configured (Windows, macOS, Linux)
- [x] GitHub token permissions set (contents: write)
- [x] Artifact upload configured for debugging
- [x] Release creation automated with softprops/action-gh-release@v1

### Release Scripts Added

**Added npm scripts to package.json:**
- `npm run release:patch` - Bump patch version (1.0.0 → 1.0.1)
- `npm run release:minor` - Bump minor version (1.0.0 → 1.1.0)
- `npm run release:major` - Bump major version (1.0.0 → 2.0.0)
- `npm run release` - Interactive release tool

**Created `scripts/release.js`:**
- Interactive CLI for creating releases
- Checks for uncommitted changes
- Offers patch/minor/major/custom version options
- Automatically commits, tags, and pushes
- Provides links to monitor GitHub Actions

**Quick Release Commands:**
```bash
# Patch release (bug fixes)
npm run release:patch

# Minor release (new features)
npm run release:minor

# Major release (breaking changes)
npm run release:major

# Interactive mode (choose version type)
npm run release
```

---

## ✅ Step 9: Update Documentation

**Task**: Document the update process for users and developers

### 9.1: Updated README.md

Added comprehensive sections:
- **Features** - Including auto-updates
- **Auto-Updates** - How it works for users
- **Manual Update Check** - Step-by-step instructions
- **Releasing New Versions** - Developer commands
- **Getting Started** - Web and Desktop development
- **Building for Production** - Build commands

### 9.2: Created Release Checklist

**File**: `docs/release-checklist.md` (CREATED)

Comprehensive guide covering:
- Pre-release checklist (tests, type check, builds, etc.)
- Three release options (quick/interactive/manual)
- Monitoring GitHub Actions
- Post-release verification (auto-update testing)
- Rollback procedures
- Troubleshooting common issues
- Version history best practices
- First release guidance (v1.0.0)
- Recommended release cadence

**Verification**:
- [x] README.md updated with auto-update information
- [x] Release checklist created at docs/release-checklist.md
- [x] Documentation is clear and complete
- [x] Instructions for both users and developers
- [x] Troubleshooting section included

---

## Step 10: Testing

**Task**: Test the update flow thoroughly

### 11.1: Development Testing

- [ ] Run app in dev mode - verify update check is skipped
- [ ] Check console logs for proper dev environment detection

### 11.2: Production Testing (Requires two versions)

1. **First Release**:
   - [ ] Build version 1.0.0
   - [ ] Install and run
   - [ ] Verify app works normally

2. **Second Release** (Test update):
   - [ ] Bump version to 1.0.1
   - [ ] Push tag and create release
   - [ ] Open version 1.0.0 app
   - [ ] Should show "Update Available" notification
   - [ ] Click "Download Update"
   - [ ] Progress bar should show download
   - [ ] Once complete, click "Install & Restart"
   - [ ] App should restart with new version
   - [ ] Verify all data is intact

3. **Manual Check**:
   - [ ] Go to Settings → Updates
   - [ ] Click "Check for Updates"
   - [ ] Verify appropriate message shown

### 11.3: Edge Cases

- [ ] Test with no internet connection (should show error)
- [ ] Test dismissing notification (should not reappear until next launch)
- [ ] Test with malformed release (should handle gracefully)

**Verification**:
- [ ] All test scenarios pass
- [ ] No data loss during update
- [ ] Error handling works properly

---

## Step 11: Initial Release Setup

**Task**: Create first release to enable auto-updates

1. **Bump version in package.json**:
   ```json
   "version": "1.0.0"
   ```

2. **Commit and push**:
   ```bash
   git add package.json
   git commit -m "chore: bump version to 1.0.0 for initial release"
   git push origin main
   ```

3. **Create and push tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **Monitor GitHub Actions**:
   - Go to https://github.com/Renkai7/mental-clarity/actions
   - Wait for "Build and Release" workflow to complete
   - Check for any errors

5. **Verify Release**:
   - Go to https://github.com/Renkai7/mental-clarity/releases
   - Verify v1.0.0 release exists
   - Verify all platform builds are present (Windows, Mac, Linux)
   - Download and test installation

**Verification**:
- [ ] Tag pushed successfully
- [ ] GitHub Actions workflow completed
- [ ] Release created with all artifacts
- [ ] Downloads work on all platforms

---

## Troubleshooting

### Update Check Not Working

- Verify `app.isPackaged` is true in production
- Check electron-log file for errors (usually in app data directory)
- Ensure GitHub repository is public or token is configured

### Download Fails

- Check internet connection
- Verify GitHub release has correct assets
- Check file permissions in app directory

### App Won't Restart After Update

- Verify `autoInstallOnAppQuit` is set correctly
- Check if antivirus is blocking the installer
- Ensure user has write permissions to app directory

### "Update Not Available" When It Should Be

- Verify version in package.json is higher than installed version
- Check that GitHub release tag matches version format (v1.0.0)
- Ensure release is not marked as draft or pre-release

---

## Success Criteria

- [ ] All steps completed without errors
- [ ] Manual update check works in settings
- [ ] Automatic update check works on app launch
- [ ] Update notification appears when update is available
- [ ] Download progress is visible
- [ ] Install and restart works smoothly
- [ ] User data persists through update
- [ ] GitHub Actions workflow builds and releases successfully
- [ ] Documentation is complete and accurate

---

## Future Enhancements

Consider adding later:
- [ ] Update changelog viewer in-app
- [ ] Beta/canary channel support
- [ ] Scheduled update checks (e.g., daily)
- [ ] Update preferences (auto-download, notifications)
- [ ] Rollback capability
- [ ] Delta updates (smaller download sizes)

---

## Notes

- Auto-updates only work in packaged/production builds
- Database file location remains constant across updates
- Electron-updater handles platform-specific installers automatically
- Updates require network connection
- First install must be manual; auto-update only works for subsequent versions
