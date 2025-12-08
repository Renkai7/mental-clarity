/**
 * MIG-001.2: Create Empty Day Tests
 *
 * Tests for the createEmptyDay helper function.
 * Part of the refactored test suite from db-sqlite.test.ts
 */

import { describe, it, beforeEach, afterEach, afterAll } from 'vitest';
import { setupTestDb, teardownTestDb, finalCleanup, expect } from '../helpers/db-test-setup';

describe('SQLite Database - createEmptyDay', () => {
  let testDbPath: string;
  let sqlite: any;
  const testDate = '2025-12-06';

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

  it('createEmptyDay creates entries for all active blocks', () => {
    sqlite.createEmptyDay(testDate);

    const entries = sqlite.getEntriesForDate(testDate);
    const blocks = sqlite.getBlocks().filter((b: any) => b.active);

    expect(entries.length).toBe(blocks.length);

    blocks.forEach((block: any) => {
      const entry = entries.find((e: any) => e.blockId === block.id);
      expect(entry).toBeDefined();
      expect(entry?.date).toBe(testDate);
    });
  });

  it('createEmptyDay initializes entries with default values', () => {
    sqlite.createEmptyDay(testDate);

    const entries = sqlite.getEntriesForDate(testDate);
    entries.forEach((entry: any) => {
      expect(entry.ruminationCount).toBe(0);
      expect(entry.compulsionsCount).toBe(0);
      expect(entry.avoidanceCount).toBe(0);
      // Anxiety and stress scores use default of 5 (not 0)
      expect(entry.anxietyScore).toBe(5);
      expect(entry.stressScore).toBe(5);
      expect(entry.notes).toBeUndefined();
    });
  });

  it('createEmptyDay is idempotent (does not overwrite existing entries)', () => {
    // Create entry manually
    const existingEntry = {
      id: `${testDate}:block-1`,
      date: testDate,
      blockId: 'block-1',
      ruminationCount: 10,
      notes: 'Existing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sqlite.upsertEntry(existingEntry);

    // Run createEmptyDay
    sqlite.createEmptyDay(testDate);

    // Existing entry should not be overwritten
    const retrieved = sqlite.getEntry(testDate, 'block-1');
    expect(retrieved.ruminationCount).toBe(10);
    expect(retrieved.notes).toBe('Existing');
  });

  it('createEmptyDay skips inactive blocks', () => {
    const blocks = sqlite.getBlocks();
    const firstBlock = blocks[0];

    // Deactivate first block
    const updatedBlocks = blocks.map((b: any) =>
      b.id === firstBlock.id ? { ...b, active: false } : b
    );
    sqlite.replaceBlocks(updatedBlocks);

    // Create empty day
    sqlite.createEmptyDay(testDate);

    // First block should not have an entry
    const entry = sqlite.getEntry(testDate, firstBlock.id);
    expect(entry).toBeNull();
  });
});
