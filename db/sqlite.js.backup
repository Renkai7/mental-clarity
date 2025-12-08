const fs = require('fs');
const path = require('path');

let Database;
let db;

function nowISO() {
  return new Date().toISOString();
}

async function init(dbFilePath) {
  if (!Database) {
    Database = require('better-sqlite3');
  }
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  db = new Database(dbFilePath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS block_configs (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      start TEXT NOT NULL,
      end TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      blockId TEXT NOT NULL,
      ruminationCount INTEGER NOT NULL DEFAULT 0,
      compulsionsCount INTEGER NOT NULL DEFAULT 0,
      avoidanceCount INTEGER NOT NULL DEFAULT 0,
      anxietyScore INTEGER NOT NULL DEFAULT 0,
      stressScore INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);

    CREATE TABLE IF NOT EXISTS daily_meta (
      date TEXT PRIMARY KEY,
      sleepQuality INTEGER NOT NULL DEFAULT 0,
      exerciseMinutes INTEGER NOT NULL DEFAULT 0,
      dailyNotes TEXT
    );
  `);
  // Migration: add dailyCI column if missing (M10.5)
  try {
    const info = db.prepare('PRAGMA table_info(daily_meta)').all();
    const hasDailyCI = info.some(col => col.name === 'dailyCI');
    if (!hasDailyCI) {
      db.prepare('ALTER TABLE daily_meta ADD COLUMN dailyCI REAL').run();
      console.log('[sqlite] Added dailyCI column to daily_meta');
    }
  } catch (e) {
    console.warn('[sqlite] Failed dailyCI migration', e);
  }
}

function migrateDefaults() {
  try {
    const tx = db.transaction(() => {
      db.prepare('UPDATE entries SET anxietyScore = 5 WHERE anxietyScore = 0').run();
      db.prepare('UPDATE entries SET stressScore = 5 WHERE stressScore = 0').run();
    });
    tx();
  } catch (e) {
    // best-effort migration; ignore if table empty or columns missing
  }
}

function seedIfNeeded() {
  const row = db.prepare('SELECT data FROM settings WHERE id = 1').get();
  if (row) return;

  const DEFAULT_BLOCKS = [
    { id: 'block-1', label: 'Wake-9AM', start: '06:00', end: '09:00', order: 0, active: 1 },
    { id: 'block-2', label: '9AM-12PM', start: '09:00', end: '12:00', order: 1, active: 1 },
    { id: 'block-3', label: '12PM-3PM', start: '12:00', end: '15:00', order: 2, active: 1 },
    { id: 'block-4', label: '3PM-6PM', start: '15:00', end: '18:00', order: 3, active: 1 },
    { id: 'block-5', label: '6PM-9PM', start: '18:00', end: '21:00', order: 4, active: 1 },
    { id: 'block-6', label: '9PM-11:59PM', start: '21:00', end: '23:59', order: 5, active: 1 },
  ];

  const settings = {
    blocks: DEFAULT_BLOCKS.map((b) => ({ ...b, active: !!b.active })),
    goals: { R: 50, C: 30, A: 20, exerciseMinutes: 30, minSleepQuality: 7 },
    ciWeights: { alphaR: 0.3, alphaC: 0.25, alphaA: 0.2, alphaAnx: 0.15, alphaStr: 0.1, betaSleep: 0.05, betaEx: 0.05 },
    ciThresholds: { greenMin: 0.66, yellowMin: 0.33 },
    caps: { maxR: 50, maxC: 30, maxA: 20 },
    defaultTab: 'R',
    heatmapMetric: 'CI',
  };

  const tx = db.transaction(() => {
    const insertBlock = db.prepare('INSERT OR REPLACE INTO block_configs (id, label, start, end, "order", active) VALUES (?, ?, ?, ?, ?, ?)');
    for (const b of DEFAULT_BLOCKS) {
      insertBlock.run(b.id, b.label, b.start, b.end, b.order, b.active ? 1 : 0);
    }
    db.prepare('INSERT INTO settings (id, data) VALUES (1, ?)').run(JSON.stringify(settings));
  });
  tx();
}

function getSettings() {
  const row = db.prepare('SELECT data FROM settings WHERE id = 1').get();
  if (!row) return null;
  try {
    return JSON.parse(row.data);
  } catch {
    return null;
  }
}

function updateSettings(settings) {
  const s = JSON.stringify(settings ?? {});
  db.prepare('INSERT INTO settings (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(s);
  return true;
}

function getBlocks() {
  const stmt = db.prepare('SELECT id, label, start, end, "order", active FROM block_configs ORDER BY "order" ASC');
  const rows = stmt.all();
  return rows.map((r) => ({ ...r, active: !!r.active }));
}

function getEntriesForDate(date) {
  const stmt = db.prepare('SELECT * FROM entries WHERE date = ? ORDER BY blockId ASC');
  const rows = stmt.all(date);
  return rows.map((r) => ({
    ...r,
    notes: r.notes == null ? undefined : r.notes,
  }));
}

function getEntry(date, blockId) {
  const stmt = db.prepare('SELECT * FROM entries WHERE date = ? AND blockId = ?');
  const row = stmt.get(date, blockId);
  if (!row) return null;
  return {
    ...row,
    notes: row.notes == null ? undefined : row.notes,
  };
}

function upsertEntry(entry) {
  const id = entry.id || `${entry.date}:${entry.blockId}`;
  const createdAt = entry.createdAt || nowISO();
  const updatedAt = nowISO();
  const stmt = db.prepare(`
    INSERT INTO entries (
      id, date, blockId, ruminationCount, compulsionsCount, avoidanceCount, anxietyScore, stressScore, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      date=excluded.date,
      blockId=excluded.blockId,
      ruminationCount=excluded.ruminationCount,
      compulsionsCount=excluded.compulsionsCount,
      avoidanceCount=excluded.avoidanceCount,
      anxietyScore=excluded.anxietyScore,
      stressScore=excluded.stressScore,
      notes=excluded.notes,
      updatedAt=excluded.updatedAt
  `);
  stmt.run(
    id,
    entry.date,
    entry.blockId,
    Number(entry.ruminationCount || 0),
    Number(entry.compulsionsCount || 0),
    Number(entry.avoidanceCount || 0),
    Number(entry.anxietyScore || 0),
    Number(entry.stressScore || 0),
    entry.notes ?? null,
    createdAt,
    updatedAt
  );
  return { id, updatedAt };
}

function getDailyMeta(date) {
  const stmt = db.prepare('SELECT date, sleepQuality, exerciseMinutes, dailyNotes, dailyCI FROM daily_meta WHERE date = ?');
  const row = stmt.get(date) || null;
  if (!row) return null;
  return {
    ...row,
    dailyCI: row.dailyCI == null ? null : Number(row.dailyCI),
    dailyNotes: row.dailyNotes == null ? undefined : row.dailyNotes,
  };
}

function upsertDailyMeta(meta) {
  const stmt = db.prepare(`
    INSERT INTO daily_meta (date, sleepQuality, exerciseMinutes, dailyNotes, dailyCI)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      sleepQuality=excluded.sleepQuality,
      exerciseMinutes=excluded.exerciseMinutes,
      dailyNotes=excluded.dailyNotes,
      dailyCI=excluded.dailyCI
  `);
  stmt.run(
    meta.date,
    Number(meta.sleepQuality || 0),
    Number(meta.exerciseMinutes || 0),
    meta.dailyNotes || null,
    meta.dailyCI == null ? null : Number(meta.dailyCI)
  );
  return true;
}

function createEmptyDay(date) {
  const blocks = getBlocks();
  const insert = db.prepare(`
    INSERT INTO entries (
      id, date, blockId, ruminationCount, compulsionsCount, avoidanceCount, anxietyScore, stressScore, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, 0, 0, 0, 5, 5, NULL, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `);
  const createdAt = nowISO();
  const updatedAt = createdAt;
  const tx = db.transaction(() => {
    for (const b of blocks) {
      if (!b.active) continue;
      const id = `${date}:${b.id}`;
      insert.run(id, date, b.id, createdAt, updatedAt);
    }
  });
  tx();
  return true;
}

function getEntriesSummary(metric, limit) {
  const col = metric === 'R' ? 'ruminationCount' : metric === 'C' ? 'compulsionsCount' : 'avoidanceCount';
  // Get latest dates that have entries
  const datesRows = db
    .prepare('SELECT date FROM entries GROUP BY date ORDER BY date DESC LIMIT ?')
    .all(Number(limit || 30));
  const dates = datesRows.map((r) => r.date);
  if (dates.length === 0) return [];

  const placeholders = dates.map(() => '?').join(',');
  const rows = db
    .prepare(`SELECT date, blockId, ${col} AS count FROM entries WHERE date IN (${placeholders})`)
    .all(...dates);

  // Aggregate into the desired shape
  const byDate = new Map();
  for (const r of rows) {
    if (!byDate.has(r.date)) byDate.set(r.date, { date: r.date, total: 0, timeframes: {} });
    const entry = byDate.get(r.date);
    const count = Number(r.count || 0);
    entry.timeframes[r.blockId] = (entry.timeframes[r.blockId] || 0) + count;
    entry.total += count;
  }

  // Sort by date desc and limit to requested size
  const sortedDates = Array.from(byDate.keys()).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  const limited = sortedDates.slice(0, Number(limit || 30));
  return limited.map((d) => byDate.get(d));
}

// Range queries (M11): fetch entries between inclusive dates
function getEntriesRange(startDate, endDate) {
  const stmt = db.prepare('SELECT * FROM entries WHERE date BETWEEN ? AND ? ORDER BY date DESC, blockId ASC');
  const rows = stmt.all(startDate, endDate);
  return rows.map(r => ({
    ...r,
    notes: r.notes == null ? undefined : r.notes,
  }));
}

function getDailyMetaRange(startDate, endDate) {
  const stmt = db.prepare('SELECT date, sleepQuality, exerciseMinutes, dailyNotes, dailyCI FROM daily_meta WHERE date BETWEEN ? AND ? ORDER BY date DESC');
  const rows = stmt.all(startDate, endDate);
  return rows.map(r => ({
    ...r,
    dailyNotes: r.dailyNotes == null ? undefined : r.dailyNotes,
    dailyCI: r.dailyCI == null ? null : Number(r.dailyCI),
  }));
}

function replaceBlocks(blocks) {
  const ids = new Set(blocks.map((b) => b.id));
  const tx = db.transaction(() => {
    const existingRows = db.prepare('SELECT id FROM block_configs').all();
    const existingIds = new Set(existingRows.map((r) => r.id));

    // Delete removed
    for (const id of existingIds) {
      if (!ids.has(id)) {
        db.prepare('DELETE FROM block_configs WHERE id = ?').run(id);
      }
    }

    // Upsert
    const upsert = db.prepare('INSERT OR REPLACE INTO block_configs (id, label, start, end, "order", active) VALUES (?, ?, ?, ?, ?, ?)');
    for (const b of blocks) {
      upsert.run(b.id, b.label, b.start, b.end, Number(b.order || 0), b.active ? 1 : 0);
    }
  });
  tx();
  return true;
}

module.exports = {
  init,
  seedIfNeeded,
  migrateDefaults,
  getSettings,
  updateSettings,
  getBlocks,
  getEntriesForDate,
  getEntry,
  upsertEntry,
  getDailyMeta,
  upsertDailyMeta,
  createEmptyDay,
  replaceBlocks,
  getEntriesSummary,
  getEntriesRange,
  getDailyMetaRange,
};
