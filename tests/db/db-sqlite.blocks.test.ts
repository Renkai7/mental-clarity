/**
 * MIG-001.2: Block Configs CRUD Tests
 *
 * Tests for block configuration storage and retrieval.
 * Part of the refactored test suite from db-sqlite.test.ts
 */

import { describe, it, beforeEach, afterEach, afterAll } from 'vitest';
import { setupTestDb, teardownTestDb, finalCleanup, expect, createTestBlock } from '../helpers/db-test-setup';

describe('SQLite Database - Block Configs CRUD', () => {
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

  // Note: Cannot test empty blocks scenario due to singleton pattern in sqlite.js
  // This will be possible after MIG-002 (dependency injection refactor)

  it('getBlocks returns blocks ordered by order field', () => {
    const blocks = sqlite.getBlocks();

    expect(blocks.length).toBeGreaterThan(0);

    // Verify order is ascending
    for (let i = 1; i < blocks.length; i++) {
      expect(blocks[i].order).toBeGreaterThanOrEqual(blocks[i - 1].order);
    }
  });

  it('getBlocks converts active from integer to boolean', () => {
    const blocks = sqlite.getBlocks();

    blocks.forEach((block: any) => {
      expect(typeof block.active).toBe('boolean');
    });
  });

  it('getBlocks returns all required fields', () => {
    const blocks = sqlite.getBlocks();
    const firstBlock = blocks[0];

    expect(firstBlock).toHaveProperty('id');
    expect(firstBlock).toHaveProperty('label');
    expect(firstBlock).toHaveProperty('start');
    expect(firstBlock).toHaveProperty('end');
    expect(firstBlock).toHaveProperty('order');
    expect(firstBlock).toHaveProperty('active');
  });

  it('replaceBlocks deletes removed blocks', () => {
    const original = sqlite.getBlocks();
    expect(original.length).toBeGreaterThan(2);

    // Keep only first block
    const newBlocks = [original[0]];
    sqlite.replaceBlocks(newBlocks);

    const updated = sqlite.getBlocks();
    expect(updated.length).toBe(1);
    expect(updated[0].id).toBe(original[0].id);
  });

  it('replaceBlocks adds new blocks', () => {
    const original = sqlite.getBlocks();

    const newBlock = {
      id: 'test-new-block',
      label: 'New Test Block',
      start: '22:00',
      end: '23:00',
      order: 999,
      active: 1, // SQLite stores as integer
    };

    sqlite.replaceBlocks([...original, newBlock]);

    const updated = sqlite.getBlocks();
    expect(updated.length).toBe(original.length + 1);

    const added = updated.find((b: any) => b.id === 'test-new-block');
    expect(added).toBeDefined();
    expect(added?.label).toBe('New Test Block');
    expect(added?.active).toBe(true); // Converted to boolean
  });

  it('replaceBlocks updates existing blocks', () => {
    const original = sqlite.getBlocks();
    const firstBlock = original[0];

    const modified = { ...firstBlock, label: 'Modified Label' };
    sqlite.replaceBlocks([modified, ...original.slice(1)]);

    const updated = sqlite.getBlocks();
    const updatedFirst = updated[0];

    expect(updatedFirst.id).toBe(firstBlock.id);
    expect(updatedFirst.label).toBe('Modified Label');
  });

  it('replaceBlocks handles empty array (removes all blocks)', () => {
    sqlite.replaceBlocks([]);
    const blocks = sqlite.getBlocks();
    expect(blocks.length).toBe(0);
  });

  // Note: Transaction rollback behavior is difficult to test reliably
  // due to SQLite's forgiving nature. Will be validated in MIG-002.
});
