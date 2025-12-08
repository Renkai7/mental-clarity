import type { Settings, BlockConfig, BlockEntry, DailyMeta } from './index';

export {}; // ensure this is treated as a module

declare global {
  interface Window {
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
    };
  }
}
