'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

// Check if we're in an Electron environment
const isElectron = typeof window !== 'undefined' && window.electronAPI;

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
    if (!isElectron || !window.electronAPI) {
      return;
    }

    // Listen for update events
    const removeAvailable = window.electronAPI.onUpdateAvailable((data: { version: string; releaseNotes?: string; releaseDate: string }) => {
      setState('available');
      setUpdateInfo(data);
    });

    const removeProgress = window.electronAPI.onUpdateDownloadProgress((data: { percent: number; transferred: number; total: number }) => {
      setState('downloading');
      setDownloadProgress(data.percent);
    });

    const removeDownloaded = window.electronAPI.onUpdateDownloaded((data: { version: string }) => {
      setState('ready');
      setUpdateInfo(prev => prev ? { ...prev, version: data.version } : null);
    });

    const removeError = window.electronAPI.onUpdateError((message: string) => {
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
    if (!window.electronAPI) return;
    setState('downloading');
    setDownloadProgress(0);
    await window.electronAPI.downloadUpdate();
  };

  const handleInstall = () => {
    if (!window.electronAPI) return;
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
      <Card className="p-4 shadow-lg border-2 border-cinematic-accent">
        {state === 'available' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-text">Update Available</h3>
              <p className="text-sm text-text-muted">
                Version {updateInfo?.version} is ready to download
              </p>
              {updateInfo?.releaseNotes && (
                <p className="text-xs text-text-muted mt-2 line-clamp-3">
                  {updateInfo.releaseNotes}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1">
                Download Update
              </Button>
              <Button onClick={handleDismiss} variant="subtle">
                Later
              </Button>
            </div>
          </div>
        )}

        {state === 'downloading' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-text">Downloading Update</h3>
              <p className="text-sm text-text-muted">
                {downloadProgress.toFixed(1)}% complete
              </p>
            </div>
            <div className="w-full bg-cinematic-900 rounded-full h-2 border border-cinematic-800">
              <div
                className="bg-cinematic-accent h-full rounded-full transition-all"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {state === 'ready' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-text">Update Ready</h3>
              <p className="text-sm text-text-muted">
                Version {updateInfo?.version} is ready to install
              </p>
              <p className="text-xs text-text-muted mt-1">
                The app will restart to complete installation
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInstall} className="flex-1">
                Install & Restart
              </Button>
              <Button onClick={handleDismiss} variant="subtle">
                Later
              </Button>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-red-400">Update Error</h3>
              <p className="text-sm text-text-muted">
                {errorMessage || 'Failed to check for updates'}
              </p>
            </div>
            <Button onClick={handleDismiss} variant="subtle" className="w-full">
              Dismiss
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
