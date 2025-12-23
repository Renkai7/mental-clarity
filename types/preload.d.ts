import type { Settings, BlockConfig, BlockEntry, DailyMeta } from './index';

export {}; // ensure this is treated as a module

declare global {
  interface Window {
    electronAPI?: {
      ping: () => Promise<string>;
      getSettings: () => Promise<Settings>;
      updateSettings: (settings: Partial<Settings>) => Promise<void>;
      getBlocks: () => Promise<BlockConfig[]>;
      replaceBlocks: (blocks: BlockConfig[]) => Promise<void>;
      getEntriesForDate: (date: string) => Promise<BlockEntry[]>;
      getEntry: (date: string, blockId: string) => Promise<BlockEntry | null>;
      upsertEntry: (entry: Partial<BlockEntry> & { date: string; blockId: string }) => Promise<{ id: string; updatedAt: string }>;
      getDailyMeta: (date: string) => Promise<DailyMeta | null>;
      upsertDailyMeta: (meta: Partial<DailyMeta> & { date: string }) => Promise<void>;
      createEmptyDay: (date: string) => Promise<void>;
      getEntriesSummary: (metric: 'R' | 'C' | 'A', limit: number) => Promise<unknown>;
      invoke?: (channel: string, ...args: unknown[]) => Promise<unknown>;
      'entries:range'?: (startDate: string, endDate: string) => Promise<BlockEntry[]>;
      'dailyMeta:range'?: (startDate: string, endDate: string) => Promise<DailyMeta[]>;

      // Auto-updater APIs
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
    };
    api?: {
      ping: () => Promise<string>;
      getSettings: () => Promise<Settings>;
      updateSettings: (settings: Partial<Settings>) => Promise<void>;
      getBlocks: () => Promise<BlockConfig[]>;
      replaceBlocks: (blocks: BlockConfig[]) => Promise<void>;
      getEntriesForDate: (date: string) => Promise<BlockEntry[]>;
      getEntry: (date: string, blockId: string) => Promise<BlockEntry | null>;
      upsertEntry: (entry: Partial<BlockEntry> & { date: string; blockId: string }) => Promise<{ id: string; updatedAt: string }>;
      getDailyMeta: (date: string) => Promise<DailyMeta | null>;
      upsertDailyMeta: (meta: Partial<DailyMeta> & { date: string }) => Promise<void>;
      createEmptyDay: (date: string) => Promise<void>;
      getEntriesSummary: (metric: 'R' | 'C' | 'A', limit: number) => Promise<unknown>;
      invoke?: (channel: string, ...args: unknown[]) => Promise<unknown>;
      'entries:range'?: (startDate: string, endDate: string) => Promise<BlockEntry[]>;
      'dailyMeta:range'?: (startDate: string, endDate: string) => Promise<DailyMeta[]>;

      // Auto-updater APIs
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
    };
  }
}
