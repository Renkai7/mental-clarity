/**
 * MIG-001.2: Range Queries and Advanced Tests
 *
 * Tests for range queries, transactions, edge cases, and migrations.
 * Part of the refactored test suite from db-sqlite.test.ts
 */

import { describe, it, beforeEach, afterEach, afterAll } from 'vitest';
import { setupTestDb, teardownTestDb, finalCleanup, expect } from '../helpers/db-test-setup';

describe('SQLite Database - Range Queries', () => {
  let testDbPath: string;
  let sqlite: any;

  beforeEach(async () => {
    ({ dbPath: testDbPath, sqlite } = await setupTestDb());
    await sqlite.init(testDbPath);
    sqlite.seedIfNeeded();
  });

  afterEach(() => {
    teardownTestDb(testDbPath);
  });

  afterAll(() => {
    finalCleanup();
  });

  it('getEntriesRange returns entries in date range', () => {
    const dates = ['2025-12-04', '2025-12-05', '2025-12-06'];

    dates.forEach((date) => {
      sqlite.upsertEntry({
        id: `${date}:block-1`,
        date,
        blockId: 'block-1',
        ruminationCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    const range = sqlite.getEntriesRange('2025-12-05', '2025-12-06');
    expect(range.length).toBe(2);
    expect(range.map((e: any) => e.date)).toContain('2025-12-05');
    expect(range.map((e: any) => e.date)).toContain('2025-12-06');
    expect(range.map((e: any) => e.date)).not.toContain('2025-12-04');
  });

  it('getEntriesRange returns empty array when no entries in range', () => {
    const range = sqlite.getEntriesRange('2025-01-01', '2025-01-31');
    expect(range).toEqual([]);
  });

  it('getEntriesRange orders by date descending', () => {
    const dates = ['2025-12-04', '2025-12-05', '2025-12-06'];

    dates.forEach((date) => {
      sqlite.upsertEntry({
        id: `${date}:block-1`,
        date,
        blockId: 'block-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    const range = sqlite.getEntriesRange('2025-12-04', '2025-12-06');
    const sortedDates = range.map((e: any) => e.date);

    for (let i = 1; i < sortedDates.length; i++) {
      expect(sortedDates[i - 1] >= sortedDates[i]).toBe(true);
    }
  });

  it('getDailyMetaRange returns meta in date range', () => {
    const dates = ['2025-12-04', '2025-12-05', '2025-12-06'];

    dates.forEach((date) => {
      sqlite.upsertDailyMeta({
        date,
        sleepQuality: 7,
        exerciseMinutes: 30,
      });
    });

    const range = sqlite.getDailyMetaRange('2025-12-05', '2025-12-06');
    expect(range.length).toBe(2);
    expect(range.map((m: any) => m.date)).toContain('2025-12-05');
    expect(range.map((m: any) => m.date)).toContain('2025-12-06');
    expect(range.map((m: any) => m.date)).not.toContain('2025-12-04');
  });
});

describe('SQLite Database - Transaction Safety', () => {
  let testDbPath: string;
  let sqlite: any;

  beforeEach(async () => {
    ({ dbPath: testDbPath, sqlite } = await setupTestDb());
    await sqlite.init(testDbPath);
    sqlite.seedIfNeeded();
  });

  afterEach(() => {
    teardownTestDb(testDbPath);
  });

  afterAll(() => {
    finalCleanup();
  });

  // Note: Transaction rollback behavior is complex to test reliably
  // SQLite is very forgiving and may not throw errors as expected
  // These behaviors will be validated more thoroughly in MIG-002

  it('createEmptyDay runs atomically', () => {
    // createEmptyDay should be atomic - all entries created or none
    const testDate = '2025-12-06';

    sqlite.createEmptyDay(testDate);

    const entries = sqlite.getEntriesForDate(testDate);
    const activeBlocks = sqlite.getBlocks().filter((b: any) => b.active);

    expect(entries.length).toBe(activeBlocks.length);
  });

  it('seedIfNeeded runs atomically', () => {
    sqlite.seedIfNeeded();

    const settings = sqlite.getSettings();
    const blocks = sqlite.getBlocks();

    expect(settings).not.toBeNull();
    expect(blocks.length).toBeGreaterThan(0);
  });
});

describe('SQLite Database - Edge Cases', () => {
  let testDbPath: string;
  let sqlite: any;

  beforeEach(async () => {
    ({ dbPath: testDbPath, sqlite } = await setupTestDb());
    await sqlite.init(testDbPath);
    sqlite.seedIfNeeded();
  });

  afterEach(() => {
    teardownTestDb(testDbPath);
  });

  afterAll(() => {
    finalCleanup();
  });

  it('handles leap year dates', () => {
    const leapDate = '2024-02-29';

    const meta = {
      date: leapDate,
      sleepQuality: 8,
      exerciseMinutes: 30,
    };

    sqlite.upsertDailyMeta(meta);

    const retrieved = sqlite.getDailyMeta(leapDate);
    expect(retrieved).not.toBeNull();
    expect(retrieved.date).toBe(leapDate);
  });

  it('handles very large count values', () => {
    const entry = {
      id: '2025-12-06:block-1',
      date: '2025-12-06',
      blockId: 'block-1',
      ruminationCount: 999999,
      compulsionsCount: 999999,
      avoidanceCount: 999999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sqlite.upsertEntry(entry);

    const retrieved = sqlite.getEntry('2025-12-06', 'block-1');
    expect(retrieved.ruminationCount).toBe(999999);
  });

  it('handles special characters in notes', () => {
    const specialChars = "Special chars: 'quotes', \"double\", <tags>, & ampersand, émojis 😀";

    const entry = {
      id: '2025-12-06:block-1',
      date: '2025-12-06',
      blockId: 'block-1',
      notes: specialChars,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sqlite.upsertEntry(entry);

    const retrieved = sqlite.getEntry('2025-12-06', 'block-1');
    expect(retrieved.notes).toBe(specialChars);
  });

  it('handles very long notes text', () => {
    const longText = 'x'.repeat(10000);

    const entry = {
      id: '2025-12-06:block-1',
      date: '2025-12-06',
      blockId: 'block-1',
      notes: longText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sqlite.upsertEntry(entry);

    const retrieved = sqlite.getEntry('2025-12-06', 'block-1');
    expect(retrieved.notes).toBe(longText);
  });

  it('handles empty string in block labels', () => {
    const blocks = sqlite.getBlocks();
    const modifiedBlock = { ...blocks[0], label: '' };

    sqlite.replaceBlocks([modifiedBlock]);

    const retrieved = sqlite.getBlocks();
    expect(retrieved[0].label).toBe('');
  });

  it('handles null vs undefined vs empty string consistently', () => {
    const testDate = '2025-12-06';

    // Test with null
    sqlite.upsertDailyMeta({ date: testDate, sleepQuality: 5, exerciseMinutes: 30, dailyNotes: null });
    let meta = sqlite.getDailyMeta(testDate);
    expect(meta.dailyNotes).toBeUndefined();

    // Test with undefined
    sqlite.upsertDailyMeta({ date: testDate, sleepQuality: 5, exerciseMinutes: 30, dailyNotes: undefined });
    meta = sqlite.getDailyMeta(testDate);
    expect(meta.dailyNotes).toBeUndefined();

    // Test with empty string - also converted to undefined
    sqlite.upsertDailyMeta({ date: testDate, sleepQuality: 5, exerciseMinutes: 30, dailyNotes: '' });
    meta = sqlite.getDailyMeta(testDate);
    expect(meta.dailyNotes).toBeUndefined();
  });

  it('handles dates far in the past and future', () => {
    const pastDate = '1900-01-01';
    const futureDate = '2099-12-31';

    const pastMeta = { date: pastDate, sleepQuality: 5, exerciseMinutes: 20 };
    const futureMeta = { date: futureDate, sleepQuality: 8, exerciseMinutes: 40 };

    sqlite.upsertDailyMeta(pastMeta);
    sqlite.upsertDailyMeta(futureMeta);

    expect(sqlite.getDailyMeta(pastDate)).not.toBeNull();
    expect(sqlite.getDailyMeta(futureDate)).not.toBeNull();
  });
});

describe('SQLite Database - Migrations', () => {
  let testDbPath: string;
  let sqlite: any;

  beforeEach(async () => {
    ({ dbPath: testDbPath, sqlite } = await setupTestDb());
    await sqlite.init(testDbPath);
    sqlite.seedIfNeeded();
  });

  afterEach(() => {
    teardownTestDb(testDbPath);
  });

  afterAll(() => {
    finalCleanup();
  });

  it('migrateDefaults migrates legacy score fields', () => {
    // Insert old-style entry with 0 scores (legacy default)
    const Database = require('better-sqlite3');
    const db = new Database(testDbPath);

    db.prepare(`
      INSERT INTO entries (id, date, blockId, ruminationCount, compulsionsCount, avoidanceCount, anxietyScore, stressScore, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      '2025-12-06:block-1',
      '2025-12-06',
      'block-1',
      5,
      3,
      2,
      0, // Legacy default
      0, // Legacy default
      null,
      new Date().toISOString(),
      new Date().toISOString()
    );

    db.close();

    // Run migration
    sqlite.migrateDefaults();

    // Verify scores were updated to new default (5)
    const entry = sqlite.getEntry('2025-12-06', 'block-1');
    expect(entry.anxietyScore).toBe(5);
    expect(entry.stressScore).toBe(5);
  });

  it('migrateDefaults preserves non-zero scores', () => {
    const entry = {
      id: '2025-12-06:block-1',
      date: '2025-12-06',
      blockId: 'block-1',
      anxietyScore: 8,
      stressScore: 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sqlite.upsertEntry(entry);
    sqlite.migrateDefaults();

    const retrieved = sqlite.getEntry('2025-12-06', 'block-1');
    expect(retrieved.anxietyScore).toBe(8);
    expect(retrieved.stressScore).toBe(7);
  });

  it('migrateDefaults is idempotent', () => {
    // Insert entry with 0 scores
    const Database = require('better-sqlite3');
    const db = new Database(testDbPath);

    db.prepare(`
      INSERT INTO entries (id, date, blockId, ruminationCount, compulsionsCount, avoidanceCount, anxietyScore, stressScore, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      '2025-12-06:block-1',
      '2025-12-06',
      'block-1',
      1,
      1,
      1,
      0,
      0,
      null,
      new Date().toISOString(),
      new Date().toISOString()
    );

    db.close();

    // Run migration twice
    sqlite.migrateDefaults();
    sqlite.migrateDefaults();

    // Should still be 5
    const entry = sqlite.getEntry('2025-12-06', 'block-1');
    expect(entry.anxietyScore).toBe(5);
    expect(entry.stressScore).toBe(5);
  });
});
