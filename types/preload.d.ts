export {}; // ensure this is treated as a module

declare global {
  interface Window {
    api?: {
      ping: () => Promise<string>;
      getSettings: () => Promise<any>;
      updateSettings: (settings: any) => Promise<any>;
      getBlocks: () => Promise<any[]>;
      replaceBlocks: (blocks: any[]) => Promise<any>;
      getEntriesForDate: (date: string) => Promise<any[]>;
      getEntry: (date: string, blockId: string) => Promise<any | null>;
      upsertEntry: (entry: any) => Promise<{ id: string; updatedAt: string } | any>;
      getDailyMeta: (date: string) => Promise<any | null>;
      upsertDailyMeta: (meta: any) => Promise<any>;
      createEmptyDay: (date: string) => Promise<any>;
    };
  }
}
