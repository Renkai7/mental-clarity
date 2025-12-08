/**
 * Test Database Helper Utilities
 * 
 * Provides centralized temp database management for SQLite tests.
 * Ensures proper cleanup and prevents leftover test files.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

// Use OS temp directory or ./tmp for test databases
const TEST_DB_DIR = process.env.TEST_DB_DIR || path.join(os.tmpdir(), 'mental-clarity-tests');

/**
 * Ensures the test database directory exists
 */
function ensureTestDbDir(): void {
  if (!fs.existsSync(TEST_DB_DIR)) {
    fs.mkdirSync(TEST_DB_DIR, { recursive: true });
  }
}

/**
 * Creates a unique test database path in the temp directory
 * @returns Absolute path to a new test database file
 */
export function createTestDbPath(): string {
  ensureTestDbDir();
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return path.join(TEST_DB_DIR, `test-db-${uniqueId}.db`);
}

/**
 * Cleans up a test database file and its associated WAL/SHM files
 * 
 * Note: On Windows, files may remain locked due to the singleton pattern in db/sqlite.js.
 * The database connection stays open across tests, preventing file deletion.
 * This will be resolved in MIG-002 when we implement dependency injection.
 * For now, files accumulate in the temp directory but are isolated from the repo.
 * 
 * @param dbPath - Path to the database file to clean up
 */
export function cleanupTestDb(dbPath: string): void {
  const filesToClean = [
    dbPath,
    `${dbPath}-wal`,
    `${dbPath}-shm`,
  ];

  for (const file of filesToClean) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (err: any) {
      // On Windows, files might still be locked - this is expected
      // Files remain in temp directory, not in repo
      if (err.code !== 'ENOENT' && err.code !== 'EBUSY') {
        console.warn(`Warning: Could not delete ${file}: ${err.message}`);
      }
    }
  }
}

/**
 * Cleans up all test database files in the temp directory
 * Useful for cleanup after full test suite run
 */
export function cleanupAllTestDbs(): void {
  if (!fs.existsSync(TEST_DB_DIR)) {
    return;
  }

  try {
    const files = fs.readdirSync(TEST_DB_DIR);
    for (const file of files) {
      if (file.startsWith('test-db-')) {
        const filePath = path.join(TEST_DB_DIR, file);
        try {
          fs.unlinkSync(filePath);
        } catch (err: any) {
          console.warn(`Warning: Could not delete ${filePath}: ${err.message}`);
        }
      }
    }
    
    // Try to remove the directory if empty
    const remainingFiles = fs.readdirSync(TEST_DB_DIR);
    if (remainingFiles.length === 0) {
      fs.rmdirSync(TEST_DB_DIR);
    }
  } catch (err: any) {
    console.warn(`Warning: Could not clean up test DB directory: ${err.message}`);
  }
}

/**
 * Gets the test database directory path
 */
export function getTestDbDir(): string {
  return TEST_DB_DIR;
}
