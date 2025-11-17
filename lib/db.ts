import Dexie, { Table } from 'dexie';
import type {
  BlockConfig,
  BlockEntry,
  DailyMeta,
  Settings,
} from '@/types';

// Dexie database definition with typed tables
export class MentalClarityDB extends Dexie {
  blockConfigs!: Table<BlockConfig, string>;
  entries!: Table<BlockEntry, string>;
  dailyMeta!: Table<DailyMeta, string>; // primary key = date
  settings!: Table<Settings & { id: string }, string>; // singleton by id

  constructor() {
    super('mentalClarityDB');

    this.version(1).stores({
      // Primary key + indexes
      blockConfigs: 'id, order, active',
      entries: 'id, date, blockId, [date+blockId]',
      dailyMeta: 'date',
      settings: 'id',
    });
  }
}

// Singleton instance. Only used on the client.
export const db = new MentalClarityDB();
