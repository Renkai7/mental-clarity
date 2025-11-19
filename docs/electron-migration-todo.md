# Electron Desktop Migration TODO

This checklist migrates the app from PWA + IndexedDB to Electron + SQLite while keeping the React/Next.js UI unchanged.

## 1) Remove PWA (if present)
- [ ] Remove any `navigator.serviceWorker.register(...)` usage
- [ ] In `app/layout.tsx`, remove `<link rel="manifest" ...>` and PWA meta tags
- [ ] Delete `public/manifest.json`, `public/sw.js`, and `public/icons/*` (if present)
- [ ] In `next.config.ts`, remove `next-pwa` integration/wrappers
- [ ] Uninstall `next-pwa` and `workbox-*` (if present)

## 2) Add Electron Shell
- [x] Add `electron/main.js` (main process, secure `BrowserWindow`, IPC handlers)
- [x] Add `electron/preload.js` (contextBridge exposing `window.api`)
- [x] Set `package.json` `main: "electron/main.js"`
- [x] Add scripts:
  - `dev:web`, `start:web`, `build:web`
  - `dev:electron`, `dev:desktop`, `start:desktop`, `dist`
- [x] Add dev deps: `electron`, `electron-builder`, `concurrently`, `wait-on`

## 3) SQLite Integration
- [x] Add `db/sqlite.js` using `better-sqlite3`
- [x] Schema tables: `block_configs`, `entries`, `daily_meta`, `settings`
- [x] Create indexes (e.g., `entries.date`)
- [x] Implement CRUD:
  - `getSettings`, `updateSettings`
  - `getBlocks`, `replaceBlocks`
  - `getEntriesForDate`, `getEntry`, `upsertEntry`
  - `getDailyMeta`, `upsertDailyMeta`
  - `createEmptyDay`
- [x] Seed DB on first run (`seedIfNeeded`) with defaults (blocks, settings)

## 4) IPC Contract (main ↔ preload ↔ renderer)
- [x] In `electron/main.js`, register handlers:
  - `settings:get`, `settings:update`
  - `blocks:get`, `blocks:replace`
  - `entries:getForDate`, `entry:get`, `entry:upsert`
  - `dailyMeta:get`, `dailyMeta:upsert`
  - `day:createEmpty`
- [x] In `electron/preload.js`, expose matching methods on `window.api`
- [x] Add `types/preload.d.ts` for TypeScript globals

## 5) Renderer Adapter (keep UI unchanged)
- [x] Add `lib/dataClient.ts` that forwards calls to `window.api`
- [x] Refactor `lib/dbUtils.ts` to use `lib/dataClient.ts` instead of Dexie
- [ ] Remove Dexie-specific code and files (`lib/db.ts`) once no longer referenced

## 6) Seed & Defaults
- [x] Move/duplicate default seed logic to main DB `seedIfNeeded()`
- [ ] Remove client-side seeding (`components/DBInitializer` or layout hooks) if present

## 7) Dev and Prod Run
- [ ] Development: `npm run dev:desktop` (Next dev + Electron)
- [ ] Production run: `npm run build:web` then `npm run start:desktop` with `next start`
- [ ] Packaging: `npm run dist` (build web + electron-builder)

## 8) Offline Verification
- [ ] Start packaged app with no network; UI loads, DB persists edits
- [ ] Verify inline grid editing, create-today CTA, pagination, day detail load/save

## 9) Security Hardening
- [ ] Ensure `BrowserWindow` opts: `contextIsolation`, `sandbox`, `nodeIntegration: false`
- [ ] Validate inputs in main process before writes (numbers non-negative, bounds)
- [ ] Consider adding a CSP header/meta and limiting `navigation`/`permissions`

## 10) Optional: IndexedDB Migration
- [ ] Add one-time data import from IndexedDB (renderer) to SQLite (main) via IPC
- [ ] Provide a Settings button: “Import from Browser Data”

## 11) CI/CD (Later)
- [ ] GitHub Actions: build release artifacts for Win/Mac/Linux on tag
- [ ] Cache native builds for `better-sqlite3`

## Notes
- The UI code should not change. All persistence flows now go through `window.api` via `lib/dataClient.ts`.
- Avoid running `npm run dev` in browser; use `npm run dev:desktop` for Electron-backed dev.