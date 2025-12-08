# Mental Clarity MVP — Updated Build Plan (Electron + SQLite Pivot)

We have pivoted from a browser-only PWA (Dexie/IndexedDB) to an Electron desktop application with a static-exported Next.js renderer and a local SQLite database accessed through secure IPC. The original milestone plan (Dexie + PWA focus) has been adapted. Completed items are checked; superseded items are annotated. Tasks retain a UI‑first sequencing while integrating the new stack (Electron main process, preload isolation, SQLite schema, IPC channel allowlist, migration system).

Primary tracked categories (counts):
* Rumination (R)
* Compulsions (C)
* Avoidance (A)

Per‑timeframe extras: Anxiety, Stress (1–10). Per‑day extras: Sleep Quality (1–10), Exercise (minutes). Heatmap uses a Clarity Index (CI) (green → yellow → red). Data persists locally via SQLite (WAL mode). Export/Import will operate on JSON (logical data dump) rather than raw DB file for portability and forward migration safety.

Follow Next.js App Router best practices from `.github/instructions/nextjs.instructions.md`. Security follow‑ups tracked in issues (#18–23).

---

## Principles (Revised)
* App Router (`app/`), TypeScript, Tailwind.
* SPA root for most views to avoid RSC network fetches in offline/static export context (implemented).
* Electron: sandboxed BrowserWindow, strict IPC allowlist, no nodeIntegration.
* SQLite (better-sqlite3) via main process; migrations for forward schema evolution.
* A11y: semantic tables/forms, keyboard nav, color‑blind‑safe palette.
* Lean renderer bundle; lazy‑load charts/history views.
* Privacy: fully local; no telemetry.
* Export/Import: JSON logical model (later optional encrypted variant).

---

## Data Model (for later functionality phases)

Types (TypeScript + Zod) and Dexie tables:
- BlockConfig: `{ id, label, start: string, end: string, order: number, active: boolean }`
- BlockEntry: `{ id, date: 'YYYY-MM-DD', blockId, ruminationCount: number, compulsionsCount: number, avoidanceCount: number, anxietyScore: 1..10, stressScore: 1..10, notes?: string, createdAt, updatedAt }`
- DailyMeta: `{ date, sleepQuality: 1..10, exerciseMinutes: number, dailyNotes?: string }`
- Settings: `{ blocks: BlockConfig[], goals: { R: number, C: number, A: number, exerciseMinutes: number, minSleepQuality: number }, ciWeights, ciThresholds, caps: { maxR: number, maxC: number, maxA: number }, defaultTab: 'R'|'C'|'A', heatmapMetric: 'CI'|'R'|'C'|'A' }`

Clarity Index (counts‑based):
- Normalize R,C,A by configurable caps; Anxiety/Stress by 10.
- Per‑block: `CI_b = 1 - (αR*R̃ + αC*C̃ + αA*Ã + αAnx*Anx̃ + αStr*Str̃)` clamped to [0,1].
- Per‑day: `CI_d = mean(CI_b) + βsleep*Sleep̃ + βex*Exercisẽ`, clamped to [0,1].
- Defaults: αR=.30, αC=.25, αA=.20, αAnx=.15, αStr=.10; βsleep=.05; βex=.05.
- Heatmap thresholds (configurable): green ≥ 0.66, yellow ≥ 0.33, else red.

---

## Milestones Overview (Electron + SQLite)

M1 Shell & SPA Navigation → M2 Main Grid (UI) → M3 Day Detail (UI) → M4 History Heatmap (UI) → M5 Stats (UI) → M6 Settings (UI) → M7 Data Layer (SQLite + IPC) → M8 Main Grid Persistence → M9 Day Detail Persistence → M10 CI & Derived Metrics → M11 History/Stats Data → M12 Export/Import → M13 Security & Hardening (ongoing) → M14 Accessibility & QA → M15 Polish & Docs.

Future (post MVP): Optional PWA packaging (low priority after Electron), auto‑update & code signing, advanced encryption, multi‑window strategy.

Each milestone lists steps, files to touch, and Definition of Done (DoD). Submit a small PR per milestone.

---

## M1 — Shell & Navigation (UI only)

### M1 — Shell & SPA Navigation
- [x] M1.1 — SPA root shell (`app/page.tsx`) consolidating Home/History/Stats/Settings internal views (supersedes separate route pages for offline static export stability).
- [x] M1.2 — Retain `app/day/[date]/page.tsx` dynamic route (day detail) with basic heading.
- [x] M1.3 — Tailwind clarity color palette variables (implemented in `app/globals.css`); safelist classes deferred (no dynamic class generation yet).
- [x] M1.4 — Navbar component (`components/Navbar.tsx`) integrated in SPA (layout decision: not in global layout for export simplicity).
- [x] M1.5 — Metric tabs component (`components/Tabs.tsx`) accessible keyboard navigation.
  - DoD: Accessible tabs with keyboard navigation & active styling.

Notes: Original multi-route History/Stats/Settings pages removed by design; future deep-linking may use hash fragments (#13 issue).

---

### M2 — Main Grid (UI only)
- [x] M2.1 — Mock data provider (`lib/mockData.ts`) for R/C/A counts (still used for stats/history mock portions; grid now uses real summary).
- [x] M2.2 — Base table component `MainMetricGrid.tsx` (semantic `<table>` structure).
- [x] M2.3 — Populate table with data (grid now driven by `useMainGridData` + IPC rather than mock provider; mock path demonstrated in component structure earlier).
- [x] M2.4 — Row click + keyboard navigation to day detail (`/day/[date]`).
- [x] M2.5 — Integration with tabs (metric switching handled in `MainPageClient` via `Tabs`).
- [x] M2.6 — Metric‑specific labeling & caption (`metricLabel` prop, dynamic headers).

DoD: Accessible table, keyboard nav, hover states, scroll on narrow screens.

---

### M3 — Day Detail (UI only)
- [x] M3.1 — Day detail page shell (`app/day/[date]/page.tsx`) formatting date + back link.
- [x] M3.2 — `DailySummary.tsx` (sleep/exercise/notes inputs, local state only).
- [x] M3.3 — `TimeframeEntryRow.tsx` (inputs for counts + anxiety/stress + notes, keyboard accessible).
- [x] M3.4 — `TimeframeGrid.tsx` assembling rows with headers.
- [x] M3.5 — `DailyTotals.tsx` sticky totals (live computation from local state).
- [x] M3.6 — `DayDetailForm.tsx` composing summary/grid/totals with local state.

DoD: Full interactive form (no persistence yet), keyboard accessible, totals live update.

---

### M4 — History Heatmap (UI only)
- [x] M4.1 — `HeatmapCell.tsx` (clickable cell with tooltip & color classes).
- [x] M4.2 — `MetricToggle.tsx` segmented control.
- [x] M4.3 — Mock heatmap data generator in `lib/mockData.ts` (CI + counts + colors + missing cells logic).
- [x] M4.4 — `Heatmap.tsx` grid navigates to day detail.
- [x] M4.5 — Load more (pagination via `onLoadMore` adding additional mock slices).
- [x] M4.6 — Integrated `HistoryView` + `HistoryViewContainer` in SPA.

DoD: 30-day heatmap, accessible cells, keyboard nav, metric toggle updates.

---

### M5 — Stats (UI only)
- [x] M5.1 — `KPICard.tsx` reusable metric card.
- [x] M5.2 — `StatsCards.tsx` grid with mock KPIs (today totals, CI, 7-day avg, streak).
- [x] M5.3 — Recharts installed (`SparklineChart`, `BarChartsImpl`) + `lib/chartConfig.ts`.
- [x] M5.4 — `Sparkline.tsx` lazy-loaded wrapper (`next/dynamic`).
- [x] M5.5 — `BarCharts.tsx` lazy-loaded bar chart.
- [x] M5.6 — Metric selector (inline buttons within `StatsView`).
- [x] M5.7 — Composed `StatsView` + container.

DoD: Responsive dashboard, charts lazy, accessible labels/tooltips.

---

### M6 — Settings (UI only)
- [x] M6.1 — `TimeframeList.tsx` list/reorder/edit/delete UI.
- [x] M6.2 — `TimeframeEditor.tsx` modal with overlap & time validation.
- [x] M6.3 — `GoalsConfig.tsx` form + validation.
- [x] M6.4 — `PreferencesConfig.tsx` form.
- [x] M6.5 — `CIConfig.tsx` accordion with validation & preview.
- [x] M6.6 — `DataManagement.tsx` export/import placeholders & clear confirmation.
- [x] M6.7 — Composed `SettingsView` + container.

DoD: Complete settings UI with accessible forms and validation (no persistence yet).

---

### M7 — Data Layer (SQLite + IPC)
- [x] M7.1 — Install & integrate `better-sqlite3` in Electron main (WAL mode, pragmatic schema).
- [x] M7.2 — Define schema: tables `settings`, `block_configs`, `entries`, `daily_meta`.
- [x] M7.3 — Implement IPC handlers for CRUD & day summary (basic validation).
- [x] M7.4 — Renderer utility layer (`lib/dbUtils.ts`) wrapping IPC calls.
- [x] M7.5 — TypeScript domain models & strict types (`types/index.ts`).
- [x] M7.6 — Zod validation (schemas in `types/schemas.ts`) used in renderer utilities.
- [x] M7.7 — Seed initial data (`lib/seed.ts` plus main init `seedIfNeeded`).
- [ ] M7.8 — IPC channel enum + preload allowlist (issue #22, pending).
- [ ] M7.9 — Structured logging (expand beyond current console usage).
- [ ] M7.10 — Error normalization (renderer-friendly messages).

DoD: Typed, validated, logged IPC layer with seed ensuring consistent baseline data.

### M8 — Main Grid Persistence
- [x] M8.1 — `useMainGridData` hook (summary retrieval + pagination state).
- [x] M8.2 — Grid uses real IPC data (`MainPageClient` -> `useMainGridData`).
- [x] M8.3 — Inline editable grid cells with optimistic + debounced save (`MainMetricGrid`).
- [x] M8.4 — Pagination / load more via increasing limit (`useMainGridData`).
- [x] M8.5 — Empty state row when no data.

DoD: Persisted edits reflected immediately; smooth scrolling & loading states.
**Task:** Generate sample data for visual development.
- Create `lib/mockData.ts`.
- Export function `getMockMainGridData(metric: 'R' | 'C' | 'A')` returning an array of ~30 day records.
- Each record: `{ date: 'YYYY-MM-DD', total: number, timeframes: { [blockId]: number } }`.
- Use realistic ranges: R (0-20), C (0-15), A (0-10) per timeframe; 6 default timeframes (Wake-9AM, 9AM-12PM, 12PM-3PM, 3PM-6PM, 6PM-9PM, 9PM-Morning).
- Generate dates backwards from today.

**Files:** `lib/mockData.ts`

**DoD:** Mock data function returns valid structure; dates and values realistic.

---

### M9 — Day Detail Persistence
- [x] M9.1 — `useDayData` hook (load entries + dailyMeta, saveEntry/saveDailyMeta/initializeDay).
- [x] M9.2 — Wire `DayDetailForm` to real data (hook integrated; initializes day, persists edits directly; autosave/debounce deferred to M9.3).
- [x] M9.3 — Autosave timeframe edits (debounced ~600ms; draft overrides with global status indicator).
- [x] M9.4 — Autosave Sleep/Exercise/Notes (debounced ~700ms; unified save status; CI recompute placeholder stubbed for M10).
- [x] M9.5 — Live totals computed from local state (`DayDetailForm`).
- [x] M9.6 — Basic validation (timeframe row clamps, summary clamps; scores enforced 1–10).

DoD: Reliable autosave without data loss; clear save status; accurate CI trigger placeholder.
**Task:** Build the base table component for the main grid.
- Create `components/MainMetricGrid.tsx` as a Client Component.
- Props: `metric: 'R' | 'C' | 'A'`, `data: MainGridRow[]`.
- Render semantic `<table>` with `<thead>` and `<tbody>`.
- Column headers: "Date", "Total", and one column per timeframe (e.g., "Wake-9", "9-12", etc.).
- Use Tailwind for styling: borders, padding, hover states on rows.
- Make table responsive with horizontal scroll on small screens.

**Files:** `components/MainMetricGrid.tsx`

**DoD:** Empty table structure renders with proper headers; responsive.

---

### M10 — Clarity Index & Derived Metrics
- [x] M10.1 — `lib/clarity.ts` normalization utilities (`normalizeCount/Score/Sleep/Exercise`, `clamp01`).
- [x] M10.2 — Block CI calculation (`computeBlockCI`).
- [x] M10.3 — Daily CI calculation (`computeDailyCI`, `computeDayCIContext`).
- [x] M10.4 — Color mapping centralized (`lib/colorMapping.ts`) + `mockData.ts` refactored to use `colorForCI` / `colorForCount`.
- [x] M10.5 — Persist CI in `daily_meta` (added `dailyCI` column + recompute on entry/meta save in `useDayData`).
- [x] M10.6 — CI settings editing UI exists (`CIConfig.tsx`); recalculation wiring pending future integration triggers (still to propagate settings changes to recompute historical days).

DoD: Deterministic CI stored per day; renderer uses threshold/color utilities consistently.
**Task:** Wire mock data into table rows.
- Import `getMockMainGridData` into `MainMetricGrid`.
- Map over data array to render `<tr>` for each day.
- Display: formatted date (e.g., "Sep 17"), total, and each timeframe value in cells.
- Add alternating row background colors for readability.
- Apply number formatting (integers, right-aligned).

**Files:** `components/MainMetricGrid.tsx`

**DoD:** Table displays 30 days of mock data; values properly formatted.

---

### Tracking Items (post-M10)
- [x] Centralize color mapping (`lib/colorMapping.ts` implemented; heatmap mock updated).
- [x] Settings-driven visualization (heatmap mock now loads dynamic caps/thresholds via `getColorMappingConfig` with async refresh; fallback defaults preserved).
- [x] Boundary tests added (`tests/colorMapping.test.ts` using Vitest for CI & count color mapping thresholds).
**Task:** Make rows clickable to navigate to day detail page.
- Wrap each `<tr>` or add click handler to navigate to `/day/[date]`.
- Use Next.js `useRouter()` hook for programmatic navigation.
- Add hover cursor pointer and subtle background color change on hover.
- Ensure keyboard accessibility (Enter key triggers navigation).

**Files:** `components/MainMetricGrid.tsx`

**DoD:** Clicking row navigates to correct day detail page; keyboard accessible.

---

### M11 — History & Stats Data
- [x] M11.1 — `useHeatmapData` hook (real per-block values & colors via range queries; lazy pagination working).
- [x] M11.2 — History view wired to real data (mock removed; load more extends actual range).
- [x] M11.3 — `lib/statsCalc.ts` (KPI, sparkline, block averages, streak logic implemented).
- [x] M11.4 — `useStatsData` hook (fetches ranges, computes KPIs, sparkline, block averages w/ labels; metric switching reloads).
- [x] M11.5 — Stats view wired to real data (KPIs + sparkline + block averages; loading & error states added; mock bar data removed).
Notes: Block averages currently span last 7 days; sparkline 14-day CI trend; future enhancement to allow user-adjustable spans & historical CI backfill when settings change.

DoD: Accurate historical & aggregate metrics; performant queries; lazy loaded large ranges.
**Task:** Connect tab state to grid display.
- Open `components/MainPageClient.tsx`.
- Pass current tab metric to `MainMetricGrid` as prop.
- Grid should re-render with appropriate data when tab changes.
- Add loading skeleton or transition effect (optional).

**Files:** `components/MainPageClient.tsx`

**DoD:** Changing tabs updates grid data; smooth UX; no flickering.

---

### M12 — Export / Import
- [ ] M12.1 — JSON export (logical model envelope with version + timestamp).
- [ ] M12.2 — CSV export (flattened entries with block labels & CI optional column).
- [ ] M12.3 — Wire export buttons (download Blob + success toast placeholder).
- [ ] M12.4 — JSON import (merge/replace, validation via Zod, conflict resolution by primary keys).
- [ ] M12.5 — Import UI integration (file input + mode selector + result feedback).
- [ ] M12.6 — Encrypted export (AES-GCM, PBKDF2) optional.
- [ ] M12.7 — Encrypted import (passphrase flow, graceful error handling).
- [ ] M12.8 — Hash verification / integrity check (optional future).

DoD: Reliable data portability with validation and optional encryption.
**Task:** Update column headers and total label based on active metric.
- Modify `MainMetricGrid` to accept `metricLabel: string` prop.
- Display metric name in table caption or above table: "Rumination Tracker" / "Compulsions Tracker" / "Avoidance Tracker".
- Ensure total column header matches metric (e.g., "Total Rumination").

**Files:** `components/MainMetricGrid.tsx`, `components/MainPageClient.tsx`

**DoD:** Labels dynamically reflect selected metric; clear visual hierarchy.

---

### M13 — Security & Hardening (Ongoing)
- [x] M13.1 — Sandbox BrowserWindow + disable nodeIntegration.
- [x] M13.2 — Navigation & window open blocking.
- [x] M13.3 — Basic numeric sanitization for IPC inputs.
- [ ] M13.4 — IPC channel enum + allowlist enforcement (issue #22).
- [ ] M13.5 — Zod schema validation for all IPC payloads (partial: renderer validates; main process not yet enforcing schemas per channel).
- [ ] M13.6 — Migration system for SQLite schema (issue #23).
- [ ] M13.7 — Permission abstractions / feature gating (issue #19).
- [x] M13.8 — CSP hardening (inline style removal, hashes, stricter directives) (issue #21).
- [ ] M13.9 — Code signing & auto-update strategy (issue #20).
- [ ] M13.10 — E2E offline regression tests (issue #17).

DoD: Enumerated, validated, migrate-safe backend; hardened renderer; reproducible updates.

### M14 — Accessibility & QA
- [ ] M14.1 — Axe audit zero violations.
- [ ] M14.2 — Full keyboard navigation & shortcuts.
- [ ] M14.3 — Skip link & focus management.
- [ ] M14.4 — WCAG AA color contrast validation (CI & heatmap colors).
- [ ] M14.5 — ARIA labeling for charts & heatmap.
- [ ] M14.6 — Screen reader pass (NVDA/JAWS).
- [ ] M14.7 — Bundle size optimization (<200KB gz main renderer target).
- [ ] M14.8 — Responsive layout validation (mobile/tablet/desktop).

DoD: Inclusive experience across assistive tech & form factors.
**Task:** Set up the day detail route with basic structure.
- Update `app/day/[date]/page.tsx` to extract date param.
- Display formatted date as page title (e.g., "Monday, September 17, 2024").
- Add back button/link to return to main page.
- Create two-section layout: daily summary at top, timeframe grid below.

**Files:** `app/day/[date]/page.tsx`

**DoD:** Page displays date; back navigation works; layout structured.

---

### M15 — Polish & Docs
- [ ] M15.1 — Empty states (`EmptyState.tsx`) across views.
- [ ] M15.2 — Loading skeleton components.
- [ ] M15.3 — Microcopy refinement & terminology consistency.
- [ ] M15.4 — Toast notifications (save/export/import feedback).
- [ ] M15.5 — Comprehensive README (update to reflect Electron + SQLite pivot).
- [ ] M15.6 — Inline documentation (JSDoc) for lib & complex components.
- [ ] M15.7 — Screenshots (`docs/screenshots/`).
- [ ] M15.8 — Final QA end-to-end journey.
- [ ] M15.9 — Styling pass with optional shadcn/ui integration (retain clarity color scale, verify a11y).

DoD: Production-ready UX, documented, visually consistent, maintainable.
**Task:** Build the top panel for daily-level data entry.
- Create `components/DailySummary.tsx` as a Client Component.
- Props: `date: string`, `sleepQuality?: number`, `exerciseMinutes?: number`, `notes?: string`.
- Render three inputs:
  - Sleep Quality: number input or stepper (1-10, with + / - buttons).
  - Exercise: number input (minutes, 0-300 range).
  - Daily Notes: textarea.
- Style as a card/panel with clear labels and spacing.

**Files:** `components/DailySummary.tsx`

**DoD:** Component renders with all inputs; visually distinct from timeframe grid.

---

## Testing Plan (to activate when persistence lands)
Unit: CI math, schema validators (Zod), migration runner, IPC channel enum enforcement, color mapping, export/import transformers, encryption helpers.
Integration (RTL): Grid inline edits, day autosave, settings propagation, heatmap metric toggle, CI recalculation side-effects.
E2E (Playwright): Day entry lifecycle, export/import roundtrip, offline editing & relaunch, SPA navigation state persistence (#13 future), security constraints (blocked navigation).
Accessibility: Axe, keyboard traversal, chart ARIA.
Performance: Module lazy-load (charts/history), IPC responsiveness, SQLite query timing.
**Task:** Build a single row for one timeframe's data.
- Create `components/TimeframeEntryRow.tsx` as a Client Component.
- Props: `blockLabel: string`, `rumination: number`, `compulsions: number`, `avoidance: number`, `anxiety: number`, `stress: number`, `notes: string`.
- Render as table row (`<tr>`) with:
  - Block label cell (e.g., "Wake - 9 AM").
  - Rumination count (stepper or number input).
  - Compulsions count (stepper or number input).
  - Avoidance count (stepper or number input).
  - Anxiety score (1-10, stepper).
  - Stress score (1-10, stepper).
  - Notes (text input or expandable textarea).
- Use consistent styling with +/- buttons or increment controls.

**Files:** `components/TimeframeEntryRow.tsx`

**DoD:** Row displays all fields; inputs are keyboard accessible; clear visual grouping.

---

## Dev Notes & Commands
Install (current):
```bash
npm install
```

Pending dependencies (post-UI scaffolding): `zod`, `date-fns`, `recharts`, optional `sonner` (toasts), optional `@radix-ui/*` or `shadcn/ui` (later styling pass), encryption libs if not using Web Crypto only.

Run dev:
```bash
npm run dev
```

Build static export (Electron resource):
```bash
npm run build:web
```

Electron start (dev):
```bash
npm run electron:dev
```

Lint:
```bash
npm run lint
```
**Task:** Assemble multiple timeframe rows into a table.
- Create `components/TimeframeGrid.tsx` as a Client Component.
- Props: `entries: TimeframeEntry[]` (array of block data).
- Render semantic `<table>` with headers: Block, Rumination, Compulsions, Avoidance, Anxiety, Stress, Notes.
- Map over entries and render `TimeframeEntryRow` for each.
- Add table styling: borders, alternating row colors, responsive scroll.

**Files:** `components/TimeframeGrid.tsx`

**DoD:** Grid displays 6 timeframe rows; headers clear; table responsive.

---

## PR Checklist (per milestone)
- Scope limited to milestone tasks (avoid unrelated refactors).
- Security: Preserve sandbox & IPC isolation; no new unvalidated channels.
- UI: Keyboard & focus states verified; responsive.
- Tests: Add/update relevant unit/integration where domain logic introduced.
- Docs: Update README and this TODO when architectural changes occur.
- A11y: Axe pass for new components.
- Performance: Lazy-load heavy components; avoid bundle bloat.

---

Superseded Items Reference (from original plan):
* Separate route pages for History/Stats/Settings replaced by SPA internal views for offline robustness.
* Dexie/IndexedDB data layer fully replaced by SQLite + IPC.
* PWA milestones deferred (Electron primary); can be reintroduced post-MVP if needed.

Status Summary (as of pivot update): Core shell, SPA navigation, SQLite schema, IPC CRUD, baseline security hardening completed. Remaining work focuses on UI feature build-out, validation, migrations, and analytics layers.
**Task:** Show live-updating totals for R/C/A as user edits.
- Create `components/DailyTotals.tsx` as a Client Component.
- Props: `ruminationTotal: number`, `compulsionsTotal: number`, `avoidanceTotal: number`.
- Render as a sticky footer or sidebar with three badges/cards showing totals.
- Style with color-coded backgrounds (neutral or using clarity scale).
- Position fixed or sticky so it's visible while scrolling.

**Files:** `components/DailyTotals.tsx`

**DoD:** Totals display; sticky positioning works; updates when props change.