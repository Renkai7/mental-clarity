/**
 * MIG-001.2: Database Initialization Tests
 *
 * Tests for database setup, schema creation, and migrations.
 * Part of the refactored test suite from db-sqlite.test.ts
 */

import { describe, it, beforeEach, afterEach, afterAll } from 'vitest';
import { setupTestDb, teardownTestDb, finalCleanup, expect, expectStandardTables } from '../helpers/db-test-setup';

describe('SQLite Database - Initialization', () => {
  let testDbPath: string;
  let sqlite: any;

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

  it('creates database file at specified path', async () => {
    const fs = await import('fs');
    expect(fs.existsSync(testDbPath)).toBe(true);
  });

  it('creates all required tables', async () => {
    const Database = require('better-sqlite3');
    const db = new Database(testDbPath);
    expectStandardTables(db);
    db.close();
  });

  it('enables WAL mode for better concurrency', async () => {
    const Database = require('better-sqlite3');
    const db = new Database(testDbPath);
    const result = db.pragma('journal_mode', { simple: true });
    expect(result).toBe('wal');
    db.close();
  });

  it('creates index on entries.date', async () => {
    const Database = require('better-sqlite3');
    const db = new Database(testDbPath);
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all();
    const indexNames = indexes.map((i: any) => i.name);
    expect(indexNames).toContain('idx_entries_date');
    db.close();
  });

  it('adds dailyCI column to daily_meta if missing', async () => {
    const Database = require('better-sqlite3');
    const db = new Database(testDbPath);
    const columns = db.prepare('PRAGMA table_info(daily_meta)').all();
    const columnNames = columns.map((c: any) => c.name);
    expect(columnNames).toContain('dailyCI');
    db.close();
  });
});
