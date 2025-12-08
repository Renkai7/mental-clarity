/**
 * MIG-001.2: Settings CRUD Tests
 *
 * Tests for settings storage and retrieval.
 * Part of the refactored test suite from db-sqlite.test.ts
 */

import { describe, it, beforeEach, afterEach, afterAll } from 'vitest';
import { setupTestDb, teardownTestDb, finalCleanup, expect } from '../helpers/db-test-setup';

describe('SQLite Database - Settings CRUD', () => {
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

  it('getSettings returns null when no settings exist', () => {
    const settings = sqlite.getSettings();
    expect(settings).toBeNull();
  });

  it('seedIfNeeded creates default settings on first run', () => {
    sqlite.seedIfNeeded();
    const settings = sqlite.getSettings();

    expect(settings).not.toBeNull();
    expect(settings).toHaveProperty('blocks');
    expect(settings).toHaveProperty('goals');
    expect(settings).toHaveProperty('ciWeights');
    expect(settings).toHaveProperty('ciThresholds');
    expect(settings).toHaveProperty('caps');
    expect(settings).toHaveProperty('defaultTab');
    expect(settings).toHaveProperty('heatmapMetric');
  });

  it('seedIfNeeded is idempotent (does not overwrite existing settings)', () => {
    sqlite.seedIfNeeded();
    const initial = sqlite.getSettings();

    // Modify settings
    const modified = { ...initial, defaultTab: 'C' };
    sqlite.updateSettings(modified);

    // Run seed again
    sqlite.seedIfNeeded();
    const afterSecondSeed = sqlite.getSettings();

    // Settings should still have modified value
    expect(afterSecondSeed.defaultTab).toBe('C');
  });

  it('updateSettings stores settings as JSON', () => {
    const newSettings = {
      blocks: [],
      goals: { R: 10, C: 8, A: 5, exerciseMinutes: 30, minSleepQuality: 7 },
      ciWeights: { alphaR: 0.3, alphaC: 0.25, alphaA: 0.2, alphaAnx: 0.15, alphaStr: 0.1, betaSleep: 0.05, betaEx: 0.05 },
      ciThresholds: { greenMin: 0.66, yellowMin: 0.33 },
      caps: { maxR: 50, maxC: 30, maxA: 20 },
      defaultTab: 'R',
      heatmapMetric: 'CI',
    };

    sqlite.updateSettings(newSettings);
    const retrieved = sqlite.getSettings();

    expect(retrieved).toEqual(newSettings);
  });

  it('updateSettings handles empty object', () => {
    sqlite.updateSettings({});
    const retrieved = sqlite.getSettings();
    expect(retrieved).toEqual({});
  });

  it('updateSettings overwrites existing settings', () => {
    const first = { foo: 'bar' };
    const second = { baz: 'qux' };

    sqlite.updateSettings(first);
    sqlite.updateSettings(second);

    const retrieved = sqlite.getSettings();
    expect(retrieved).toEqual(second);
    expect(retrieved).not.toHaveProperty('foo');
  });
});
