/**
 * MIG-001.2: Entries CRUD Tests
 *
 * Tests for block entry storage and retrieval.
 * Part of the refactored test suite from db-sqlite.test.ts
 */

import { describe, it, beforeEach, afterEach, afterAll } from 'vitest';
import { setupTestDb, teardownTestDb, finalCleanup, expect, createTestEntry } from '../helpers/db-test-setup';

describe('SQLite Database - Entries CRUD', () => {
  let testDbPath: string;
  let sqlite: any;
  const testDate = '2025-12-06';
  const testBlockId = 'block-1';

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

  it('getEntriesForDate returns empty array when no entries exist', () => {
    const entries = sqlite.getEntriesForDate(testDate);
    expect(entries).toEqual([]);
  });

  it('getEntry returns null when entry does not exist', () => {
    const entry = sqlite.getEntry(testDate, testBlockId);
    expect(entry).toBeNull();
  });

  it('upsertEntry creates new entry', () => {
    const newEntry = {
      id: `${testDate}:${testBlockId}`,
      date: testDate,
      blockId: testBlockId,
      ruminationCount: 5,
      compulsionsCount: 3,
      avoidanceCount: 2,
      anxietyScore: 7,
      stressScore: 6,
      notes: 'Test notes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = sqlite.upsertEntry(newEntry);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('updatedAt');

    const retrieved = sqlite.getEntry(testDate, testBlockId);
    expect(retrieved).toMatchObject({
      id: newEntry.id,
      date: newEntry.date,
      blockId: newEntry.blockId,
      ruminationCount: newEntry.ruminationCount,
      compulsionsCount: newEntry.compulsionsCount,
      avoidanceCount: newEntry.avoidanceCount,
      anxietyScore: newEntry.anxietyScore,
      stressScore: newEntry.stressScore,
      notes: newEntry.notes,
    });
  });

  it('upsertEntry updates existing entry', () => {
    const entry = {
      id: `${testDate}:${testBlockId}`,
      date: testDate,
      blockId: testBlockId,
      ruminationCount: 5,
      compulsionsCount: 3,
      avoidanceCount: 2,
      anxietyScore: 7,
      stressScore: 6,
      notes: 'Original',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sqlite.upsertEntry(entry);

    const updated = { ...entry, ruminationCount: 10, notes: 'Updated' };
    sqlite.upsertEntry(updated);

    const retrieved = sqlite.getEntry(testDate, testBlockId);
    expect(retrieved.ruminationCount).toBe(10);
    expect(retrieved.notes).toBe('Updated');
  });

  it('upsertEntry generates id if not provided', () => {
    const entry = {
      date: testDate,
      blockId: testBlockId,
      ruminationCount: 1,
      compulsionsCount: 2,
      avoidanceCount: 3,
      anxietyScore: 5,
      stressScore: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = sqlite.upsertEntry(entry);
    expect(result.id).toBeDefined();
    expect(result.id).toContain(testDate);
    expect(result.id).toContain(testBlockId);
  });

  it('upsertEntry uses default values for counts/scores', () => {
    const minimal = {
      id: `${testDate}:${testBlockId}`,
      date: testDate,
      blockId: testBlockId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sqlite.upsertEntry(minimal);
    const retrieved = sqlite.getEntry(testDate, testBlockId);

    expect(retrieved.ruminationCount).toBe(0);
    expect(retrieved.compulsionsCount).toBe(0);
    expect(retrieved.avoidanceCount).toBe(0);
    expect(retrieved.anxietyScore).toBe(0);
    expect(retrieved.stressScore).toBe(0);
  });

  it('upsertEntry stores null notes as undefined', () => {
    const entry = {
      id: `${testDate}:${testBlockId}`,
      date: testDate,
      blockId: testBlockId,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sqlite.upsertEntry(entry);
    const retrieved = sqlite.getEntry(testDate, testBlockId);
    expect(retrieved.notes).toBeUndefined();
  });

  it('upsertEntry stores undefined notes as undefined', () => {
    const entry = {
      id: `${testDate}:${testBlockId}`,
      date: testDate,
      blockId: testBlockId,
      notes: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sqlite.upsertEntry(entry);
    const retrieved = sqlite.getEntry(testDate, testBlockId);
    expect(retrieved.notes).toBeUndefined();
  });

  it('upsertEntry stores empty string notes', () => {
    const entry = {
      id: `${testDate}:${testBlockId}`,
      date: testDate,
      blockId: testBlockId,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sqlite.upsertEntry(entry);
    const retrieved = sqlite.getEntry(testDate, testBlockId);
    expect(retrieved.notes).toBe('');
  });

  it('getEntriesForDate returns all entries for date', () => {
    const entries = [
      {
        id: `${testDate}:block-1`,
        date: testDate,
        blockId: 'block-1',
        ruminationCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${testDate}:block-2`,
        date: testDate,
        blockId: 'block-2',
        ruminationCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    entries.forEach((e) => sqlite.upsertEntry(e));

    const retrieved = sqlite.getEntriesForDate(testDate);
    expect(retrieved.length).toBe(2);
    expect(retrieved.map((e: any) => e.blockId)).toContain('block-1');
    expect(retrieved.map((e: any) => e.blockId)).toContain('block-2');
  });

  it('getEntriesForDate only returns entries for specified date', () => {
    const date1 = '2025-12-05';
    const date2 = '2025-12-06';

    const entry1 = {
      id: `${date1}:block-1`,
      date: date1,
      blockId: 'block-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const entry2 = {
      id: `${date2}:block-1`,
      date: date2,
      blockId: 'block-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sqlite.upsertEntry(entry1);
    sqlite.upsertEntry(entry2);

    const retrieved = sqlite.getEntriesForDate(date1);
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].date).toBe(date1);
  });
});
