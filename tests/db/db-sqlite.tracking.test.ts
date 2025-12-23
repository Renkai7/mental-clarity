import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { setupTestDb, teardownTestDb, finalCleanup } from '../helpers/db-test-setup';

describe('SQLite Database - Day Tracking', () => {
  let sqlite: any;
  let dbPath: string;

  beforeEach(async () => {
    const setup = await setupTestDb();
    sqlite = setup.sqlite;
    dbPath = setup.dbPath;
    await sqlite.init(dbPath);
  });

  afterEach(() => {
    teardownTestDb(dbPath);
  });

  afterAll(() => {
    finalCleanup();
  });

  it('should create daily_meta with tracked=false by default', () => {
    const date = '2024-01-15';
    sqlite.upsertDailyMeta({
      date,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: 'Test day',
      dailyCI: null,
    });

    const meta = sqlite.getDailyMeta(date);
    expect(meta).toBeTruthy();
    expect(meta.tracked).toBe(false);
  });

  it('should update tracked status to true', () => {
    const date = '2024-01-15';
    
    // Create initial daily meta
    sqlite.upsertDailyMeta({
      date,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: 'Test day',
      dailyCI: null,
      tracked: false,
    });

    let meta = sqlite.getDailyMeta(date);
    expect(meta.tracked).toBe(false);

    // Update to tracked
    sqlite.upsertDailyMeta({
      date,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: 'Test day',
      dailyCI: null,
      tracked: true,
    });

    meta = sqlite.getDailyMeta(date);
    expect(meta.tracked).toBe(true);
  });

  it('should persist tracked status after update', () => {
    const date = '2024-01-15';
    
    // Create with tracked=true
    sqlite.upsertDailyMeta({
      date,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: 'Test day',
      dailyCI: null,
      tracked: true,
    });

    // Update other fields but keep tracked
    sqlite.upsertDailyMeta({
      date,
      sleepQuality: 8,
      exerciseMinutes: 45,
      dailyNotes: 'Updated day',
      dailyCI: null,
      tracked: true,
    });

    const meta = sqlite.getDailyMeta(date);
    expect(meta.tracked).toBe(true);
    expect(meta.sleepQuality).toBe(8);
    expect(meta.exerciseMinutes).toBe(45);
  });

  it('should allow untracking a day', () => {
    const date = '2024-01-15';
    
    // Create with tracked=true
    sqlite.upsertDailyMeta({
      date,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: 'Test day',
      dailyCI: null,
      tracked: true,
    });

    let meta = sqlite.getDailyMeta(date);
    expect(meta.tracked).toBe(true);

    // Untrack
    sqlite.upsertDailyMeta({
      date,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: 'Test day',
      dailyCI: null,
      tracked: false,
    });

    meta = sqlite.getDailyMeta(date);
    expect(meta.tracked).toBe(false);
  });

  it('should handle tracked field in range queries', () => {
    const dates = ['2024-01-13', '2024-01-14', '2024-01-15'];
    
    // Create meta with different tracked statuses
    sqlite.upsertDailyMeta({
      date: dates[0],
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: 'Day 1',
      dailyCI: null,
      tracked: true,
    });
    
    sqlite.upsertDailyMeta({
      date: dates[1],
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: 'Day 2',
      dailyCI: null,
      tracked: false,
    });
    
    sqlite.upsertDailyMeta({
      date: dates[2],
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: 'Day 3',
      dailyCI: null,
      tracked: true,
    });

    const range = sqlite.getDailyMetaRange('2024-01-13', '2024-01-15');
    expect(range).toHaveLength(3);
    
    const trackedDays = range.filter((m: any) => m.tracked === true);
    const untrackedDays = range.filter((m: any) => m.tracked === false);
    
    expect(trackedDays).toHaveLength(2);
    expect(untrackedDays).toHaveLength(1);
  });

  it('should not reset tracked status when updating other fields without specifying tracked', () => {
    const date = '2024-01-15';
    
    // Create with tracked=true
    sqlite.upsertDailyMeta({
      date,
      sleepQuality: 7,
      exerciseMinutes: 30,
      dailyNotes: 'Test day',
      dailyCI: null,
      tracked: true,
    });

    // Update without specifying tracked (should preserve it)
    sqlite.upsertDailyMeta({
      date,
      sleepQuality: 8,
      exerciseMinutes: 45,
      dailyNotes: 'Updated',
      dailyCI: null,
      tracked: true, // We need to pass this explicitly
    });

    const meta = sqlite.getDailyMeta(date);
    expect(meta.tracked).toBe(true);
  });
});
