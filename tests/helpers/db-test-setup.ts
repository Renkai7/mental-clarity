/**
 * Shared test setup and utilities for SQLite database tests.
 * Used across all db-sqlite.*.test.ts files to avoid duplication.
 */

import { describe, beforeEach, afterEach, afterAll, expect } from 'vitest';
import { createTestDbPath, cleanupTestDb, cleanupAllTestDbs } from './test-db.js';

export { describe, beforeEach, afterEach, afterAll, expect };

/**
 * Standard setup for database tests.
 * Call this in beforeEach to get a fresh DB path and sqlite module.
 */
export async function setupTestDb() {
  const dbPath = createTestDbPath();
  // Dynamically import to ensure fresh module state per test
  const sqlite = await import('../../db/sqlite.js');
  return { dbPath, sqlite };
}

/**
 * Standard teardown for database tests.
 * Call this in afterEach to clean up test database files.
 */
export function teardownTestDb(dbPath: string) {
  cleanupTestDb(dbPath);
}

/**
 * Final cleanup for all test databases.
 * Call this in afterAll to attempt cleanup of any remaining files.
 */
export function finalCleanup() {
  cleanupAllTestDbs();
}

/**
 * Common assertion: verify database has expected tables.
 */
export function expectStandardTables(db: any) {
  const tables = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    )
    .all();
  const tableNames = tables.map((t: any) => t.name);
  expect(tableNames).toEqual(['block_configs', 'daily_meta', 'entries', 'settings']);
}

/**
 * Common test data factory: create a standard block config.
 */
export function createTestBlock(overrides: Partial<any> = {}) {
  return {
    id: 'test-block',
    label: 'Test Block',
    type: 'single' as const,
    weight: 1.0,
    order: 0,
    active: true,
    ...overrides,
  };
}

/**
 * Common test data factory: create a standard entry.
 */
export function createTestEntry(date: string, blockId: string, overrides: Partial<any> = {}) {
  return {
    date,
    blockId,
    score: 5,
    notes: null,
    ...overrides,
  };
}

/**
 * Common test data factory: create standard daily meta.
 */
export function createTestDailyMeta(date: string, overrides: Partial<any> = {}) {
  return {
    date,
    dailyNotes: null,
    sleepHours: null,
    exercise: null,
    dailyCI: null,
    ...overrides,
  };
}
