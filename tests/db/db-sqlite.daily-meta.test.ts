/**
 * MIG-001.2: Daily Meta CRUD Tests
 *
 * Tests for daily metadata storage and retrieval.
 * Part of the refactored test suite from db-sqlite.test.ts
 */

import { describe, it, beforeEach, afterEach, afterAll } from 'vitest';
import { setupTestDb, teardownTestDb, finalCleanup, expect, createTestDailyMeta } from '../helpers/db-test-setup';

describe('SQLite Database - Daily Meta CRUD', () => {
  let testDbPath: string;
  let sqlite: any;
  const testDate = '2025-12-06';

  beforeEach(async () => {
    ({ dbPath: testDbPath, sqlite } = await setupTestDb());
    await sqlite.init(testDbPath);
  });

  afterEach(() => {
    teardownTestDb(testDbPath);
  });

  afterAll(() => {
    finalCleanup();
  });

  it('getDailyMeta returns null when meta does not exist', () => {
    const meta = sqlite.getDailyMeta(testDate);
    expect(meta).toBeNull();
  });

  it('upsertDailyMeta creates new daily meta', () => {
    const newMeta = {
      date: testDate,
      sleepQuality: 8,
      exerciseMinutes: 45,
      dailyNotes: 'Felt great today',
      dailyCI: 0.75,
    };

    sqlite.upsertDailyMeta(newMeta);

    const retrieved = sqlite.getDailyMeta(testDate);
    expect(retrieved).toMatchObject(newMeta);
  });

  it('upsertDailyMeta updates existing meta', () => {
    const initial = {
      date: testDate,
      sleepQuality: 5,
      exerciseMinutes: 20,
      dailyNotes: 'Initial',
      dailyCI: 0.5,
    };

    sqlite.upsertDailyMeta(initial);

    const updated = {
      date: testDate,
      sleepQuality: 9,
      exerciseMinutes: 60,
      dailyNotes: 'Updated',
      dailyCI: 0.85,
    };

    sqlite.upsertDailyMeta(updated);

    const retrieved = sqlite.getDailyMeta(testDate);
    expect(retrieved.sleepQuality).toBe(9);
    expect(retrieved.exerciseMinutes).toBe(60);
    expect(retrieved.dailyNotes).toBe('Updated');
    expect(retrieved.dailyCI).toBe(0.85);
  });

  it('upsertDailyMeta stores null dailyNotes', () => {
    const meta = {
      date: testDate,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: null,
      dailyCI: null,
    };

    sqlite.upsertDailyMeta(meta);

    const retrieved = sqlite.getDailyMeta(testDate);
    expect(retrieved.dailyNotes).toBeUndefined(); // Converted to undefined
    expect(retrieved.dailyCI).toBeNull();
  });

  it('upsertDailyMeta stores undefined dailyNotes as null', () => {
    const meta = {
      date: testDate,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: undefined,
      dailyCI: undefined,
    };

    sqlite.upsertDailyMeta(meta);

    const retrieved = sqlite.getDailyMeta(testDate);
    expect(retrieved.dailyNotes).toBeUndefined();
    expect(retrieved.dailyCI).toBeNull();
  });

  it('upsertDailyMeta stores empty string dailyNotes as undefined', () => {
    const meta = {
      date: testDate,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: '',
      dailyCI: null,
    };

    sqlite.upsertDailyMeta(meta);

    const retrieved = sqlite.getDailyMeta(testDate);
    // Empty strings are converted to undefined by the database layer
    expect(retrieved.dailyNotes).toBeUndefined();
  });

  it('upsertDailyMeta handles dailyCI as null', () => {
    const meta = {
      date: testDate,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyCI: null,
    };

    sqlite.upsertDailyMeta(meta);

    const retrieved = sqlite.getDailyMeta(testDate);
    expect(retrieved.dailyCI).toBeNull();
  });

  it('upsertDailyMeta stores dailyCI as number', () => {
    const meta = {
      date: testDate,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyCI: 0.65,
    };

    sqlite.upsertDailyMeta(meta);

    const retrieved = sqlite.getDailyMeta(testDate);
    expect(typeof retrieved.dailyCI).toBe('number');
    expect(retrieved.dailyCI).toBe(0.65);
  });
});
