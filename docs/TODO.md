# Mental Clarity MVP — UI‑First Build Plan (Coding Agent)

Local, private PWA for tracking Mental Clarity. Primary tracked categories are counts (not minutes):
- Rumination (R)
- Compulsions (C)
- Avoidance (A)

Per‑timeframe extras: Anxiety and Stress (1–10). Per‑day extras: Sleep Quality (1–10) and Exercise (minutes). Data stays on device via IndexedDB (Dexie). Export/Import supported. Heatmap uses a Clarity Index (green → yellow → red).

This document provides a step‑by‑step plan with milestones for an agent to implement features incrementally. We build the UI first to nail the look, then wire functionality. Follow Next.js App Router best practices from `.github/instructions/nextjs.instructions.md`.

---

## Principles
- App Router (`app/`), TypeScript, Tailwind.
- Client Components only where interactivity is needed; Server Components for shells.
- Offline‑first PWA; no telemetry; everything local.
- A11y: semantic tables/forms, keyboard nav, color‑blind‑safe palette.
- Keep bundle lean; lazy‑load charts and history views.

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

## Milestones Overview (UI first → functionality)

M1 Shell & Navigation (UI) → M2 Main Grid (UI) → M3 Day Detail (UI) → M4 History Heatmap (UI) → M5 Stats (UI) → M6 Settings (UI) → M7 Data Layer (Dexie) → M8 Main Grid Persistence → M9 Detail Persistence → M10 CI & Derived Metrics → M11 History/Stats Data → M12 Export/Import → M13 PWA & Offline → M14 Accessibility & QA → M15 Polish & Docs.

Each milestone lists steps, files to touch, and Definition of Done (DoD). Submit a small PR per milestone.

---

## M1 — Shell & Navigation (UI only)

### M1.1 — Create route structure
**Task:** Set up all route files with placeholder content.
- Create `app/page.tsx` (Main page) with "Mental Clarity Tracker" heading and empty container.
- Create `app/day/[date]/page.tsx` with "Day Detail: {date}" heading.
- Create `app/history/page.tsx` with "History" heading.
- Create `app/stats/page.tsx` with "Statistics" heading.
- Create `app/settings/page.tsx` with "Settings" heading.
- Each page should be a Server Component with basic semantic HTML structure.

**Files:** `app/page.tsx`, `app/day/[date]/page.tsx`, `app/history/page.tsx`, `app/stats/page.tsx`, `app/settings/page.tsx`

**DoD:** All routes accessible; no 404s; proper headings display.

---

### M1.2 — Configure Tailwind color palette
**Task:** Add custom green→yellow→red scale for heatmap and status indicators.
- Open `app/globals.css` and add custom CSS variables for clarity colors.
- Define clarity scale: `--clarity-high` (green #22c55e), `--clarity-medium` (yellow #eab308), `--clarity-low` (red #ef4444).
- Add intermediate shades if needed for smooth gradients.
- Update Tailwind safelist in `tailwind.config.ts` to include dynamic background classes.

**Files:** `app/globals.css`, `tailwind.config.ts`

**DoD:** Color variables accessible; classes like `bg-clarity-high` work in components.

---

### M1.3 — Create navigation component
**Task:** Build a reusable navigation header with route links.
- Create `components/Navbar.tsx` as a Client Component (`'use client'`).
- Include logo/title "Mental Clarity" on the left.
- Add navigation links: Home, History, Stats, Settings (using Next.js `Link`).
- Style with Tailwind: sticky header, responsive layout, active link highlighting.
- Export component.

**Files:** `components/Navbar.tsx`

**DoD:** Navbar renders; links navigate correctly; active state visible.

---

### M1.4 — Create metric tabs component
**Task:** Build tabs for switching between Rumination, Compulsions, and Avoidance views.
- Create `components/Tabs.tsx` as a Client Component.
- Props: `activeTab: 'R' | 'C' | 'A'`, `onTabChange: (tab) => void`.
- Render three tab buttons with labels "Rumination", "Compulsions", "Avoidance".
- Apply active styling (border-bottom or background) to selected tab.
- Keyboard accessible (arrow keys for tab switching).

**Files:** `components/Tabs.tsx`

**DoD:** Tabs render; clicking changes active state; keyboard navigation works.

---

### M1.5 — Integrate navbar and tabs into layout
**Task:** Update root layout to include navigation and page structure.
- Open `app/layout.tsx`.
- Import and place `<Navbar />` at the top of the body.
- Add a main content wrapper with proper semantic HTML (`<main>`).
- Ensure consistent padding/margins and responsive container width.
- Keep existing metadata and font configurations.

**Files:** `app/layout.tsx`

**DoD:** Navbar appears on all pages; layout is responsive; no styling conflicts.

---

### M1.6 — Add tabs to main page
**Task:** Integrate metric tabs on the main page only.
- Open `app/page.tsx`.
- Import `Tabs` component and create a wrapper Client Component `MainPageClient.tsx` if needed (to manage tab state).
- Set default tab to 'R' (Rumination).
- Display current tab name below tabs as placeholder: "Showing: Rumination".
- Use React state to manage active tab.

**Files:** `app/page.tsx`, `components/MainPageClient.tsx` (new)

**DoD:** Main page shows tabs; clicking tabs updates displayed metric name; state persists during interaction.

---

## M2 — Main Grid (UI only)

### M2.1 — Create mock data provider
**Task:** Generate sample data for visual development.
- Create `lib/mockData.ts`.
- Export function `getMockMainGridData(metric: 'R' | 'C' | 'A')` returning an array of ~30 day records.
- Each record: `{ date: 'YYYY-MM-DD', total: number, timeframes: { [blockId]: number } }`.
- Use realistic ranges: R (0-20), C (0-15), A (0-10) per timeframe; 6 default timeframes (Wake-9AM, 9AM-12PM, 12PM-3PM, 3PM-6PM, 6PM-9PM, 9PM-Morning).
- Generate dates backwards from today.

**Files:** `lib/mockData.ts`

**DoD:** Mock data function returns valid structure; dates and values realistic.

---

### M2.2 — Create table component structure
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

### M2.3 — Populate table with mock data
**Task:** Wire mock data into table rows.
- Import `getMockMainGridData` into `MainMetricGrid`.
- Map over data array to render `<tr>` for each day.
- Display: formatted date (e.g., "Sep 17"), total, and each timeframe value in cells.
- Add alternating row background colors for readability.
- Apply number formatting (integers, right-aligned).

**Files:** `components/MainMetricGrid.tsx`

**DoD:** Table displays 30 days of mock data; values properly formatted.

---

### M2.4 — Add row click navigation
**Task:** Make rows clickable to navigate to day detail page.
- Wrap each `<tr>` or add click handler to navigate to `/day/[date]`.
- Use Next.js `useRouter()` hook for programmatic navigation.
- Add hover cursor pointer and subtle background color change on hover.
- Ensure keyboard accessibility (Enter key triggers navigation).

**Files:** `components/MainMetricGrid.tsx`

**DoD:** Clicking row navigates to correct day detail page; keyboard accessible.

---

### M2.5 — Integrate grid with main page tabs
**Task:** Connect tab state to grid display.
- Open `components/MainPageClient.tsx`.
- Pass current tab metric to `MainMetricGrid` as prop.
- Grid should re-render with appropriate data when tab changes.
- Add loading skeleton or transition effect (optional).

**Files:** `components/MainPageClient.tsx`

**DoD:** Changing tabs updates grid data; smooth UX; no flickering.

---

### M2.6 — Add metric-specific labeling
**Task:** Update column headers and total label based on active metric.
- Modify `MainMetricGrid` to accept `metricLabel: string` prop.
- Display metric name in table caption or above table: "Rumination Tracker" / "Compulsions Tracker" / "Avoidance Tracker".
- Ensure total column header matches metric (e.g., "Total Rumination").

**Files:** `components/MainMetricGrid.tsx`, `components/MainPageClient.tsx`

**DoD:** Labels dynamically reflect selected metric; clear visual hierarchy.

---

## M3 — Day Detail (UI only)

### M3.1 — Create day detail page shell
**Task:** Set up the day detail route with basic structure.
- Update `app/day/[date]/page.tsx` to extract date param.
- Display formatted date as page title (e.g., "Monday, September 17, 2024").
- Add back button/link to return to main page.
- Create two-section layout: daily summary at top, timeframe grid below.

**Files:** `app/day/[date]/page.tsx`

**DoD:** Page displays date; back navigation works; layout structured.

---

### M3.2 — Create daily summary component
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

### M3.3 — Create timeframe entry row component
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

### M3.4 — Create timeframe grid component
**Task:** Assemble multiple timeframe rows into a table.
- Create `components/TimeframeGrid.tsx` as a Client Component.
- Props: `entries: TimeframeEntry[]` (array of block data).
- Render semantic `<table>` with headers: Block, Rumination, Compulsions, Avoidance, Anxiety, Stress, Notes.
- Map over entries and render `TimeframeEntryRow` for each.
- Add table styling: borders, alternating row colors, responsive scroll.

**Files:** `components/TimeframeGrid.tsx`

**DoD:** Grid displays 6 timeframe rows; headers clear; table responsive.

---

### M3.5 — Create sticky daily totals component
**Task:** Show live-updating totals for R/C/A as user edits.
- Create `components/DailyTotals.tsx` as a Client Component.
- Props: `ruminationTotal: number`, `compulsionsTotal: number`, `avoidanceTotal: number`.
- Render as a sticky footer or sidebar with three badges/cards showing totals.
- Style with color-coded backgrounds (neutral or using clarity scale).
- Position fixed or sticky so it's visible while scrolling.

**Files:** `components/DailyTotals.tsx`

**DoD:** Totals display; sticky positioning works; updates when props change.

---

### M3.6 — Integrate all components into day detail page
**Task:** Compose the full day detail form.
- Open `app/day/[date]/page.tsx` or create wrapper Client Component `components/DayDetailForm.tsx`.
- Instantiate `DailySummary` at top.
- Place `TimeframeGrid` below with mock data (6 timeframes with sample values).
- Add `DailyTotals` component with calculated sums from timeframe data.
- Wire local state to manage all form values (no persistence yet).
- Compute totals from timeframe entries and pass to `DailyTotals`.

**Files:** `app/day/[date]/page.tsx`, `components/DayDetailForm.tsx`

**DoD:** Full page functional with local state; totals update as user types; all inputs work; no save functionality yet.

---

## M4 — History Heatmap (UI only)

### M4.1 — Create heatmap cell component
**Task:** Build a single cell for the heatmap.
- Create `components/HeatmapCell.tsx` as a Client Component.
- Props: `value: number`, `label: string`, `color: 'green' | 'yellow' | 'red' | 'gray'`, `onClick: () => void`.
- Render as a colored square/rectangle with the value displayed.
- Apply appropriate background color from Tailwind clarity scale.
- Add hover effect with tooltip showing label and exact value.
- Make keyboard accessible (focusable, Enter triggers onClick).

**Files:** `components/HeatmapCell.tsx`

**DoD:** Cell renders with correct color; tooltip works; clickable and keyboard accessible.

---

### M4.2 — Create metric toggle component
**Task:** Build controls to switch heatmap metric.
- Create `components/MetricToggle.tsx` as a Client Component.
- Props: `activeMetric: 'CI' | 'R' | 'C' | 'A'`, `onMetricChange: (metric) => void`.
- Render four radio buttons or segmented control: "Clarity Index", "Rumination", "Compulsions", "Avoidance".
- Style active selection clearly.
- Keyboard accessible (arrow keys to switch).

**Files:** `components/MetricToggle.tsx`

**DoD:** Toggle renders; clicking changes active metric; accessible.

---

### M4.3 — Create mock heatmap data provider
**Task:** Generate sample data for heatmap development.
- Add function `getMockHeatmapData(metric: 'CI' | 'R' | 'C' | 'A')` to `lib/mockData.ts`.
- Return array of last 30 days, each with: `{ date, blocks: [{ blockId, value, color }] }`.
- Calculate mock CI values (0-1) and map to colors; for R/C/A use counts and threshold logic.
- Ensure realistic variation and some missing data (gray cells).

**Files:** `lib/mockData.ts`

**DoD:** Mock function returns structured heatmap data; colors vary realistically.

---

### M4.4 — Create heatmap grid component
**Task:** Assemble cells into a calendar-style grid.
- Create `components/Heatmap.tsx` as a Client Component.
- Props: `metric: 'CI' | 'R' | 'C' | 'A'`, `data: HeatmapData[]`.
- Render as a grid: rows = dates (descending), columns = timeframe labels.
- Use CSS Grid for layout.
- Map over data and render `HeatmapCell` for each block.
- Add row headers (dates) and column headers (block labels).
- Handle cell click: navigate to `/day/[date]`.

**Files:** `components/Heatmap.tsx`

**DoD:** Grid displays 30 days × 6 timeframes; cells colored correctly; navigation works.

---

### M4.5 — Add infinite scroll / load more
**Task:** Enable viewing older data beyond initial 30 days.
- Add "Load More" button at bottom of heatmap.
- Mock loading additional 30 days when clicked.
- Update state to append older data to grid.
- Add loading spinner/skeleton while "loading".
- Optional: implement intersection observer for true infinite scroll.

**Files:** `components/Heatmap.tsx`

**DoD:** Load more works; grid extends with older dates; smooth UX.

---

### M4.6 — Integrate heatmap into history page
**Task:** Wire everything together on the history page.
- Open `app/history/page.tsx` or create `components/HistoryView.tsx` Client Component.
- Add `MetricToggle` at top with state management.
- Pass selected metric to `Heatmap` component.
- Load mock data based on selected metric.
- Add page title and instructions.

**Files:** `app/history/page.tsx`, `components/HistoryView.tsx`

**DoD:** Full history page functional; metric toggle changes heatmap display; navigation to day detail works.

---

## M5 — Stats (UI only)

### M5.1 — Create KPI card component
**Task:** Build a reusable card for displaying key metrics.
- Create `components/KPICard.tsx` as a Client Component.
- Props: `title: string`, `value: number | string`, `subtitle?: string`, `trend?: 'up' | 'down' | 'neutral'`, `color?: string`.
- Render as a styled card with title, large value, optional subtitle/description.
- Add optional trend indicator (arrow icon or color).
- Style with Tailwind: shadow, border, padding.

**Files:** `components/KPICard.tsx`

**DoD:** Card renders with all variants; responsive; clear visual hierarchy.

---

### M5.2 — Create stats cards grid
**Task:** Display primary KPIs on stats page.
- Create `components/StatsCards.tsx` as a Client Component.
- Render grid of KPI cards showing:
  - Today's Rumination Total (mock value)
  - Today's Compulsions Total (mock value)
  - Today's Avoidance Total (mock value)
  - Today's Clarity Index (mock value)
  - 7-Day Average CI (mock value)
  - Current Streak (mock value, e.g., "5 days logged")
- Use CSS Grid for responsive 2-3 column layout.

**Files:** `components/StatsCards.tsx`

**DoD:** All cards display with mock data; grid responsive; visually balanced.

---

### M5.3 — Install and configure chart library
**Task:** Add Recharts for data visualization.
- Run `npm install recharts` (or chosen chart library).
- Create utility/wrapper for consistent chart theming in `lib/chartConfig.ts`.
- Define default colors, fonts, responsive container settings.
- Export reusable chart wrapper component if needed.

**Files:** `package.json`, `lib/chartConfig.ts`

**DoD:** Recharts installed; basic config set; no build errors.

---

### M5.4 — Create sparkline component
**Task:** Build a small line chart for CI trend.
- Create `components/Sparkline.tsx` as a Client Component.
- Props: `data: { date: string, value: number }[]`, `height?: number`.
- Use Recharts `LineChart` with minimal styling (no axes labels, just line).
- Default to 14 days of mock CI data.
- Add tooltip showing date and value on hover.
- Make component lazy-loadable with `next/dynamic`.

**Files:** `components/Sparkline.tsx`

**DoD:** Sparkline renders with mock data; smooth line; tooltip works; lazy-loads correctly.

---

### M5.5 — Create bar chart component
**Task:** Build bar charts for R/C/A by timeframe.
- Create `components/BarCharts.tsx` as a Client Component.
- Props: `metric: 'R' | 'C' | 'A'`, `data: { blockLabel: string, average: number }[]`.
- Use Recharts `BarChart` with X-axis (timeframe labels) and Y-axis (counts).
- Display one chart showing last 7-day average per timeframe for selected metric.
- Add color coding matching metric (e.g., R=red-ish, C=blue-ish, A=orange-ish).
- Include tooltip and axis labels.
- Make component lazy-loadable.

**Files:** `components/BarCharts.tsx`

**DoD:** Bar chart renders with 6 bars (one per timeframe); responsive; accessible labels; lazy-loads.

---

### M5.6 — Add metric selector for bar charts
**Task:** Allow users to switch which metric is displayed in bar chart.
- Reuse or create new tabs/buttons component for R/C/A selection.
- Add to stats page below KPI cards.
- Update bar chart data based on selection.
- Use local state to manage selected metric.

**Files:** `components/StatsView.tsx` (wrapper), or `app/stats/page.tsx`

**DoD:** User can switch between R/C/A; chart updates accordingly.

---

### M5.7 — Integrate all components into stats page
**Task:** Compose the full stats dashboard.
- Open `app/stats/page.tsx` or create `components/StatsView.tsx` Client Component.
- Layout: 
  - Page title "Statistics"
  - `StatsCards` at top
  - Section with "Clarity Index Trend (14 days)" and `Sparkline`
  - Section with metric selector and `BarCharts`
- Add loading skeletons for charts (optional).
- Use mock data for all visualizations.

**Files:** `app/stats/page.tsx`, `components/StatsView.tsx`

**DoD:** Full stats page functional; all charts display with mock data; responsive layout; charts lazy-load.

---

## M6 — Settings (UI only)

### M6.1 — Create timeframe list component
**Task:** Display list of configured timeframes.
- Create `components/TimeframeList.tsx` as a Client Component.
- Props: `blocks: BlockConfig[]`, `onEdit: (block) => void`, `onDelete: (blockId) => void`, `onReorder: (fromIndex, toIndex) => void`.
- Render list of timeframe cards showing: label, start time, end time, active status.
- Add Edit and Delete buttons per item.
- Add drag handles for reordering (or up/down buttons).
- Style with clear visual separation between items.

**Files:** `components/TimeframeList.tsx`

**DoD:** List displays mock timeframes; buttons fire callbacks; reorder UI works (even if not fully functional yet).

---

### M6.2 — Create timeframe editor modal/form
**Task:** Build form for adding/editing a timeframe.
- Create `components/TimeframeEditor.tsx` as a Client Component.
- Props: `block?: BlockConfig`, `onSave: (block) => void`, `onCancel: () => void`.
- Form fields:
  - Label (text input, required)
  - Start Time (time input HH:mm, required)
  - End Time (time input HH:mm, required)
  - Active (checkbox, default true)
- Client-side validation:
  - Label not empty
  - End time after start time
  - Check for overlaps with existing blocks (pass existing blocks as prop)
- Show validation errors inline.
- Save and Cancel buttons.

**Files:** `components/TimeframeEditor.tsx`

**DoD:** Form renders; validation works; callbacks fire with correct data; accessible.

---

### M6.3 — Create goals configuration component
**Task:** Build form for setting daily goals.
- Create `components/GoalsConfig.tsx` as a Client Component.
- Props: `goals: Goals`, `onSave: (goals) => void`.
- Form fields:
  - Max Rumination (number, default 50)
  - Max Compulsions (number, default 30)
  - Max Avoidance (number, default 20)
  - Min Exercise Minutes (number, default 30)
  - Min Sleep Quality (1-10, default 7)
- Add descriptions explaining each goal.
- Save button at bottom.

**Files:** `components/GoalsConfig.tsx`

**DoD:** Form displays with mock default values; updates local state; save callback works.

---

### M6.4 — Create preferences configuration component
**Task:** Build form for app preferences.
- Create `components/PreferencesConfig.tsx` as a Client Component.
- Props: `preferences: Preferences`, `onSave: (prefs) => void`.
- Form fields:
  - Default Tab (radio: R/C/A, default R)
  - Heatmap Metric (dropdown: CI/R/C/A, default CI)
- Style as simple form with clear labels.

**Files:** `components/PreferencesConfig.tsx`

**DoD:** Form works; options selectable; save fires callback.

---

### M6.5 — Create advanced CI configuration component
**Task:** Build form for tweaking Clarity Index weights and thresholds.
- Create `components/CIConfig.tsx` as a Client Component.
- Props: `ciSettings: CISettings`, `onSave: (settings) => void`.
- Collapsible/accordion section labeled "Advanced: Clarity Index Tuning".
- Form fields:
  - Weight sliders (0-1) for: Rumination, Compulsions, Avoidance, Anxiety, Stress (sum warning if > 1).
  - Cap inputs (max values for normalization): maxR, maxC, maxA.
  - Threshold inputs (0-1): green threshold, yellow threshold.
- Show live example color based on thresholds.
- Reset to defaults button.

**Files:** `components/CIConfig.tsx`

**DoD:** Accordion works; sliders functional; validation present; reset works; no save to DB yet.

---

### M6.6 — Create data management component
**Task:** Build UI for export/import/clear actions.
- Create `components/DataManagement.tsx` as a Client Component.
- Buttons:
  - Export JSON (downloads file, placeholder action)
  - Export CSV (downloads file, placeholder action)
  - Import JSON (file upload input, placeholder action)
  - Clear All Data (with confirmation modal, placeholder action)
- Add warning text about data loss for Clear All.
- Style with danger colors for destructive actions.

**Files:** `components/DataManagement.tsx`

**DoD:** Buttons render; click handlers log actions (no real functionality yet); confirmation modal works.

---

### M6.7 — Integrate all components into settings page
**Task:** Compose the full settings interface.
- Open `app/settings/page.tsx` or create `components/SettingsView.tsx` Client Component.
- Layout sections:
  1. Timeframes (with `TimeframeList` + Add button opening `TimeframeEditor`)
  2. Goals (`GoalsConfig`)
  3. Preferences (`PreferencesConfig`)
  4. Advanced (`CIConfig`)
  5. Data Management (`DataManagement`)
- Use collapsible sections or tabs if too long.
- Wire local state for all forms (no persistence yet).
- Add section headings and descriptions.

**Files:** `app/settings/page.tsx`, `components/SettingsView.tsx`

**DoD:** Full settings page navigable; all forms work with local state; validation works; no DB interaction yet.

---

## M7 — Data Layer (functionality)

### M7.1 — Install dependencies
**Task:** Add required packages for data layer.
- Run `npm install dexie zod date-fns`.
- Verify installations in `package.json`.

**Files:** `package.json`

**DoD:** All packages installed; no errors.

---

### M7.2 — Define TypeScript types
**Task:** Create core data types.
- Create `types/index.ts`.
- Define interfaces:
  - `BlockConfig`: id, label, start, end, order, active
  - `BlockEntry`: id, date, blockId, ruminationCount, compulsionsCount, avoidanceCount, anxietyScore, stressScore, notes, createdAt, updatedAt
  - `DailyMeta`: date, sleepQuality, exerciseMinutes, dailyNotes
  - `Goals`: R, C, A, exerciseMinutes, minSleepQuality
  - `CIWeights`: alphaR, alphaC, alphaA, alphaAnx, alphaStr, betaSleep, betaEx
  - `CIThresholds`: greenMin, yellowMin
  - `Settings`: blocks, goals, ciWeights, ciThresholds, caps, defaultTab, heatmapMetric
- Export all types.

**Files:** `types/index.ts`

**DoD:** All types defined; compilable; no errors.

---

### M7.3 — Create Zod schemas
**Task:** Add runtime validation schemas.
- Create `types/schemas.ts`.
- Define Zod schemas matching all TypeScript types from M7.2.
- Add custom validations:
  - Scores 1-10
  - Counts non-negative
  - Date format YYYY-MM-DD
  - Time format HH:mm
- Export schemas and infer types.

**Files:** `types/schemas.ts`

**DoD:** Schemas validate correctly; test with sample data.

---

### M7.4 — Initialize Dexie database
**Task:** Set up IndexedDB with Dexie.
- Create `lib/db.ts`.
- Define Dexie database class extending `Dexie`.
- Create tables: `blockConfigs`, `entries`, `dailyMeta`, `settings`.
- Define indexes: entries by date, entries by blockId, dailyMeta by date.
- Set version to 1.
- Export db instance.

**Files:** `lib/db.ts`

**DoD:** DB initializes in browser; tables created; inspect in DevTools.

---

### M7.5 — Create seed data function
**Task:** Generate default configuration on first run.
- Create `lib/seed.ts`.
- Export async function `seedDefaultData()`.
- Check if settings exist; if not, create:
  - 6 default timeframes (Wake-9AM, 9AM-12PM, 12PM-3PM, 3PM-6PM, 6PM-9PM, 9PM-Morning)
  - Default goals (R:50, C:30, A:20, exercise:30, sleep:7)
  - Default CI weights and thresholds
  - Default preferences (tab:R, heatmap:CI)
- Insert into DB.

**Files:** `lib/seed.ts`

**DoD:** Function runs; settings and blocks created in DB; idempotent (safe to run multiple times).

---

### M7.6 — Create database utility functions
**Task:** Build helper functions for common queries.
- Create `lib/dbUtils.ts`.
- Export functions:
  - `getSettings(): Promise<Settings>`
  - `updateSettings(settings: Settings): Promise<void>`
  - `getBlocks(): Promise<BlockConfig[]>`
  - `getEntriesForDate(date: string): Promise<BlockEntry[]>`
  - `getDailyMeta(date: string): Promise<DailyMeta | undefined>`
  - `upsertEntry(entry: BlockEntry): Promise<void>`
  - `upsertDailyMeta(meta: DailyMeta): Promise<void>`
- Use Zod to validate before inserting.

**Files:** `lib/dbUtils.ts`

**DoD:** All functions work; test with sample data; proper error handling.

---

### M7.7 — Initialize database on app load
**Task:** Run seed on first app launch.
- Update `app/layout.tsx` or create `components/DBInitializer.tsx` Client Component.
- Run `seedDefaultData()` in useEffect on mount (only once).
- Handle loading state.
- Show error if DB fails to initialize.

**Files:** `app/layout.tsx`, `components/DBInitializer.tsx`

**DoD:** Default data created on first visit; verified in IndexedDB DevTools.

---

## M8 — Main Grid Persistence

### M8.1 — Create data fetching hook for main grid
**Task:** Build custom hook to load entries from DB.
- Create `hooks/useMainGridData.ts`.
- Export hook `useMainGridData(metric: 'R' | 'C' | 'A', daysToLoad: number)`.
- Fetch last N days of entries from DB.
- Compute daily totals per metric.
- Return: `{ data: MainGridRow[], isLoading, error, loadMore }`.
- Handle pagination state.

**Files:** `hooks/useMainGridData.ts`

**DoD:** Hook fetches real data; totals computed correctly; loading states work.

---

### M8.2 — Replace mock data with real data
**Task:** Wire database to MainMetricGrid.
- Update `components/MainPageClient.tsx` to use `useMainGridData` hook.
- Remove mock data imports.
- Pass real data to `MainMetricGrid`.
- Add loading skeleton while data loads.
- Handle empty state (no entries yet).

**Files:** `components/MainPageClient.tsx`

**DoD:** Grid displays real data from DB; empty state works; loads on mount.

---

### M8.3 — Add inline edit functionality
**Task:** Enable editing counts directly in grid cells.
- Update `MainMetricGrid` to make cells editable.
- Add increment (+) and decrement (-) buttons per cell, or make cell a number input.
- On change, call `upsertEntry` from dbUtils.
- Implement optimistic UI updates (update local state immediately).
- Add debouncing (500ms) to reduce DB writes.
- Show save indicator (e.g., checkmark) when persisted.

**Files:** `components/MainMetricGrid.tsx`, `lib/dbUtils.ts`

**DoD:** Edits save to DB; optimistic UI works; reload shows persisted values; smooth UX.

---

### M8.4 — Add pagination/infinite scroll
**Task:** Load more historical data on demand.
- Add "Load More" button or intersection observer at grid bottom.
- Call `loadMore()` from hook to fetch older entries.
- Append to existing data without flickering.
- Disable button when all data loaded.

**Files:** `components/MainPageClient.tsx`, `hooks/useMainGridData.ts`

**DoD:** User can load 30+ more days; performance stays smooth; no duplicates.

---

## M9 — Day Detail Persistence

### M9.1 — Create data fetching hook for day detail
**Task:** Build hook to load single day's data.
- Create `hooks/useDayData.ts`.
- Export hook `useDayData(date: string)`.
- Fetch all entries for that date.
- Fetch dailyMeta for that date.
- Return: `{ entries, dailyMeta, isLoading, error, saveEntry, saveDailyMeta }`.
- Include save functions that call dbUtils and update local state.

**Files:** `hooks/useDayData.ts`

**DoD:** Hook loads and saves data; works for new and existing dates.

---

### M9.2 — Wire day detail form to database
**Task:** Replace mock data with real DB data.
- Update `components/DayDetailForm.tsx` to use `useDayData` hook.
- Load existing entries on mount.
- If no entries exist for a timeframe, show empty/zero values.
- Display loading state while fetching.

**Files:** `components/DayDetailForm.tsx`

**DoD:** Form loads real data; shows correct values; handles missing data gracefully.

---

### M9.3 — Implement autosave for timeframe entries
**Task:** Save entries as user types.
- Add onChange handlers to all timeframe inputs.
- Debounce saves (500ms after last keystroke).
- Call `saveEntry` from hook.
- Show save status indicator ("Saving...", "Saved", "Error").
- Handle validation errors inline.

**Files:** `components/TimeframeEntryRow.tsx`, `components/TimeframeGrid.tsx`

**DoD:** All timeframe edits autosave; status feedback clear; no data loss.

---

### M9.4 — Implement autosave for daily meta
**Task:** Save Sleep Quality and Exercise.
- Add onChange handlers to `DailySummary` inputs.
- Debounce saves (500ms).
- Call `saveDailyMeta` from hook.
- Show save status.

**Files:** `components/DailySummary.tsx`

**DoD:** Daily meta saves correctly; reload shows persisted values.

---

### M9.5 — Update daily totals live
**Task:** Recalculate and display totals as user edits.
- Compute R/C/A totals from current form state in real-time.
- Pass to `DailyTotals` component.
- Ensure totals update immediately on input change (before save).

**Files:** `components/DayDetailForm.tsx`

**DoD:** Totals always reflect current form state; no lag.

---

## M10 — Clarity Index & Thresholds

### M10.1 — Implement normalization functions
**Task:** Create utility functions for normalizing values.
- Create `lib/clarity.ts`.
- Export `normalizeValue(value: number, max: number): number` (returns 0-1).
- Export `normalizeScore(score: number): number` (for 1-10 scores, returns 0-1).
- Handle edge cases (division by zero, negative values).

**Files:** `lib/clarity.ts`

**DoD:** Functions tested with various inputs; correct outputs.

---

### M10.2 — Implement block CI calculation
**Task:** Calculate CI for a single timeframe.
- Add to `lib/clarity.ts`.
- Export `calculateBlockCI(entry: BlockEntry, settings: Settings): number`.
- Apply formula: `CI = 1 - (αR*R̃ + αC*C̃ + αA*Ã + αAnx*Anx̃ + αStr*Str̃)`.
- Clamp result to [0, 1].
- Use weights and caps from settings.

**Files:** `lib/clarity.ts`

**DoD:** Function returns correct CI values; tested with sample data.

---

### M10.3 — Implement daily CI calculation
**Task:** Calculate CI for entire day.
- Add to `lib/clarity.ts`.
- Export `calculateDailyCI(entries: BlockEntry[], dailyMeta: DailyMeta, settings: Settings): number`.
- Compute mean of all block CIs.
- Add bonuses from sleep and exercise.
- Clamp to [0, 1].

**Files:** `lib/clarity.ts`

**DoD:** Function returns correct daily CI; handles missing data.

---

### M10.4 — Implement color mapping
**Task:** Map CI values to colors.
- Add to `lib/clarity.ts`.
- Export `getCIColor(ci: number, thresholds: CIThresholds): 'green' | 'yellow' | 'red'`.
- Apply threshold logic.

**Files:** `lib/clarity.ts`

**DoD:** Color mapping correct; tested with edge cases.

---

### M10.5 — Cache daily CI in database
**Task:** Store computed CI to avoid recalculation.
- Update `DailyMeta` type to include `clarityIndex?: number`.
- After saving entries or dailyMeta, recalculate and store CI.
- Update `lib/dbUtils.ts` functions.

**Files:** `types/index.ts`, `lib/dbUtils.ts`, `lib/clarity.ts`

**DoD:** CI cached; verified in DB; recalculates when entries change.

---

### M10.6 — Wire CI settings to settings page
**Task:** Enable editing weights, caps, thresholds.
- Update `components/CIConfig.tsx` to load from and save to DB.
- Use `getSettings()` and `updateSettings()`.
- Validate inputs (weights sum check, thresholds 0-1).
- Show live preview of color thresholds.

**Files:** `components/CIConfig.tsx`, `app/settings/page.tsx`

**DoD:** Settings persist; changes apply immediately to CI calculations.

---

## M11 — History & Stats Data

### M11.1 — Create heatmap data hook
**Task:** Build hook to fetch heatmap data from DB.
- Create `hooks/useHeatmapData.ts`.
- Export hook `useHeatmapData(metric: 'CI' | 'R' | 'C' | 'A', daysToLoad: number)`.
- Fetch entries and compute appropriate values per block per day.
- Map values to colors using thresholds.
- Return: `{ data, isLoading, error, loadMore }`.

**Files:** `hooks/useHeatmapData.ts`

**DoD:** Hook returns structured heatmap data; metric toggle works.

---

### M11.2 — Wire heatmap to real data
**Task:** Replace mock data in heatmap component.
- Update `components/HistoryView.tsx` to use `useHeatmapData`.
- Pass real data to `Heatmap` component.
- Handle loading and empty states.

**Files:** `components/HistoryView.tsx`

**DoD:** Heatmap shows real historical data; colors reflect actual CI/R/C/A values.

---

### M11.3 — Create stats calculation utilities
**Task:** Build functions for stats computations.
- Create `lib/statsCalc.ts`.
- Export functions:
  - `calculateRollingAverage(entries: BlockEntry[], days: number, metric: keyof BlockEntry): number`
  - `calculateStreak(dates: string[]): number` (consecutive days with entries)
  - `calculateTimeframeAverages(entries: BlockEntry[], metric: keyof BlockEntry): { blockId: string, average: number }[]`
- Handle missing data and edge cases.

**Files:** `lib/statsCalc.ts`

**DoD:** Functions tested; return correct values.

---

### M11.4 — Create stats data hook
**Task:** Build hook to compute all stats metrics.
- Create `hooks/useStatsData.ts`.
- Export hook `useStatsData()`.
- Fetch relevant entries (today, last 7/14/30 days).
- Compute all KPIs: today totals, averages, CI values, streaks.
- Compute sparkline data.
- Compute bar chart data.
- Return: `{ kpis, sparklineData, barChartData, isLoading, error }`.

**Files:** `hooks/useStatsData.ts`

**DoD:** Hook provides all necessary stats data; performs well.

---

### M11.5 — Wire stats page to real data
**Task:** Replace mock data in stats components.
- Update `components/StatsView.tsx` to use `useStatsData`.
- Pass real KPI values to `StatsCards`.
- Pass real data to `Sparkline` and `BarCharts`.
- Handle loading states.

**Files:** `components/StatsView.tsx`

**DoD:** All stats display real data; accurate calculations; updates when data changes.

---

## M12 — Export / Import

### M12.1 — Implement JSON export
**Task:** Export all data to JSON file.
- Create `lib/exportImport.ts`.
- Export async function `exportToJSON(): Promise<Blob>`.
- Gather all data: settings, blockConfigs, entries, dailyMeta.
- Create envelope: `{ version: 1, exportedAt: ISO string, data: {...} }`.
- Return as Blob.
- Add download helper: `downloadFile(blob: Blob, filename: string)`.

**Files:** `lib/exportImport.ts`

**DoD:** Function exports complete data; file downloads correctly.

---

### M12.2 — Implement CSV export
**Task:** Export entries as CSV.
- Add to `lib/exportImport.ts`.
- Export async function `exportToCSV(): Promise<Blob>`.
- Flatten entries to CSV rows: date, blockId, blockLabel, R, C, A, anxiety, stress, notes.
- Include header row.
- Return as Blob.

**Files:** `lib/exportImport.ts`

**DoD:** CSV file contains all entries; opens correctly in Excel/Sheets.

---

### M12.3 — Wire export buttons
**Task:** Connect export functions to UI.
- Update `components/DataManagement.tsx`.
- On "Export JSON" click, call `exportToJSON()` and download.
- On "Export CSV" click, call `exportToCSV()` and download.
- Add loading state during export.
- Show success toast.

**Files:** `components/DataManagement.tsx`

**DoD:** Export buttons work; files download with correct names; data complete.

---

### M12.4 — Implement JSON import
**Task:** Import and validate JSON data.
- Add to `lib/exportImport.ts`.
- Export async function `importFromJSON(file: File, mode: 'merge' | 'replace'): Promise<ImportResult>`.
- Parse JSON.
- Validate envelope structure and version.
- Validate all data with Zod schemas.
- If replace mode: clear existing data first.
- If merge mode: upsert entries (by date+blockId), merge settings cautiously.
- Return result: `{ success: boolean, entriesImported: number, errors: string[] }`.

**Files:** `lib/exportImport.ts`

**DoD:** Function validates and imports data; handles errors; merge and replace modes work.

---

### M12.5 — Wire import button
**Task:** Connect import function to UI.
- Update `components/DataManagement.tsx`.
- Add file input for JSON upload.
- Add mode selector (merge/replace) with explanations.
- On import, call `importFromJSON()` and show progress.
- Display result: success count or error messages.
- Refresh UI after successful import.

**Files:** `components/DataManagement.tsx`

**DoD:** Import works; user can choose mode; validation errors shown; success reloads data.

---

### M12.6 — Implement encrypted export (optional)
**Task:** Add passphrase-protected export.
- Add to `lib/exportImport.ts`.
- Export async function `exportEncrypted(passphrase: string): Promise<Blob>`.
- Derive key from passphrase using PBKDF2 (150k iterations).
- Encrypt JSON data using AES-GCM (Web Crypto API).
- Include salt, IV, and version in output.
- Return as Blob.

**Files:** `lib/exportImport.ts`

**DoD:** Encrypted export works; file smaller than plain JSON.

---

### M12.7 — Implement encrypted import (optional)
**Task:** Import encrypted files.
- Add to `lib/exportImport.ts`.
- Export async function `importEncrypted(file: File, passphrase: string, mode): Promise<ImportResult>`.
- Extract salt and IV.
- Derive key from passphrase.
- Decrypt using AES-GCM.
- Handle wrong passphrase gracefully.
- Parse and validate decrypted JSON.
- Proceed with normal import.

**Files:** `lib/exportImport.ts`

**DoD:** Encrypted import works; wrong passphrase shows clear error.

---

### M12.8 — Wire encrypted export/import to UI
**Task:** Add encrypted options to data management.
- Update `components/DataManagement.tsx`.
- Add "Export Encrypted" button with passphrase input modal.
- Update import to detect encrypted files and prompt for passphrase.
- Add help text explaining encryption.

**Files:** `components/DataManagement.tsx`

**DoD:** Encrypted export/import fully functional; UX clear.

---

## M13 — PWA & Offline

### M13.1 — Install PWA dependencies
**Task:** Add PWA tooling.
- Run `npm install @ducanh2912/next-pwa` (or `next-pwa` if maintained).
- Install `workbox-*` if needed for custom service worker logic.

**Files:** `package.json`

**DoD:** Dependencies installed; no errors.

---

### M13.2 — Configure next-pwa
**Task:** Set up PWA in Next.js config.
- Update `next.config.ts` to wrap config with `withPWA`.
- Configure options: `dest: 'public'`, `register: true`, `skipWaiting: true`.
- Set `disable: process.env.NODE_ENV === 'development'` (optional).

**Files:** `next.config.ts`

**DoD:** Config valid; builds without errors.

---

### M13.3 — Create web app manifest
**Task:** Define PWA metadata.
- Create `public/manifest.json`.
- Set name: "Mental Clarity Tracker".
- Set short_name, description, theme_color, background_color.
- Set display: "standalone".
- Add start_url: "/".
- Define icons array (placeholder paths for now).

**Files:** `public/manifest.json`

**DoD:** Manifest valid; linked in HTML head.

---

### M13.4 — Generate app icons
**Task:** Create icon assets for PWA.
- Generate icons: 192x192, 512x512 PNG.
- Create favicon.ico.
- Place in `public/icons/` folder.
- Update manifest icons paths.
- Add apple-touch-icon for iOS.

**Files:** `public/icons/*`, `public/manifest.json`, `app/layout.tsx`

**DoD:** Icons display correctly in install prompt and app launcher.

---

### M13.5 — Configure service worker caching
**Task:** Set caching strategies.
- If using custom service worker, create `public/sw.js` or configure in next.config.
- Cache strategies:
  - App shell: Cache First
  - Static assets (JS/CSS): Cache First with update
  - API calls: Network First (or not applicable for local app)
- Ensure offline fallback.

**Files:** `next.config.ts`, custom service worker if needed

**DoD:** App loads offline; static assets cached; verified in DevTools.

---

### M13.6 — Add install prompt
**Task:** Prompt users to install app.
- Create `components/InstallPrompt.tsx` Client Component.
- Listen for `beforeinstallprompt` event.
- Show custom install button/banner when event fires.
- Trigger prompt on button click.
- Hide prompt after installation.
- Detect if already installed (display mode standalone).

**Files:** `components/InstallPrompt.tsx`, `app/layout.tsx`

**DoD:** Install prompt appears on desktop/mobile; installation works.

---

### M13.7 — Test offline functionality
**Task:** Verify full offline capability.
- Build production version.
- Install as PWA.
- Disable network in DevTools.
- Test: navigate pages, edit entries, view stats.
- Verify data persists in IndexedDB.
- Re-enable network and confirm no data loss.

**Files:** N/A (testing)

**DoD:** App fully functional offline; all features work; data safe.

---

## M14 — Accessibility & QA

### M14.1 — Run axe accessibility audit
**Task:** Identify and fix a11y violations.
- Install `@axe-core/react` or use browser extension.
- Run audit on all main pages: Main, Day Detail, History, Stats, Settings.
- Document violations.
- Fix issues: missing labels, low contrast, incorrect ARIA, heading order, etc.
- Re-run audit until zero violations.

**Files:** Various components

**DoD:** All pages pass axe audit with zero violations.

---

### M14.2 — Implement keyboard navigation
**Task:** Ensure full keyboard accessibility.
- Test tab order on all pages; ensure logical flow.
- Add keyboard shortcuts:
  - Arrow up/down to increment/decrement number inputs.
  - Enter to submit forms or navigate.
  - Escape to close modals.
- Ensure all interactive elements focusable.
- Add visible focus indicators (focus ring).

**Files:** All interactive components

**DoD:** Complete navigation possible with keyboard only; shortcuts work.

---

### M14.3 — Add skip link
**Task:** Allow keyboard users to skip navigation.
- Add skip link to `app/layout.tsx` at very top.
- Link to main content area with id="main-content".
- Style to appear only on focus.

**Files:** `app/layout.tsx`, `app/globals.css`

**DoD:** Skip link appears on tab; jumps to main content.

---

### M14.4 — Verify color contrast
**Task:** Ensure WCAG AA compliance for all text.
- Check contrast ratios for:
  - Normal text (4.5:1 minimum)
  - Large text (3:1 minimum)
  - Heatmap colors against text/borders
  - Chart labels
- Use contrast checker tools.
- Adjust colors if needed.

**Files:** `app/globals.css`, component styles

**DoD:** All text meets WCAG AA contrast requirements.

---

### M14.5 — Add ARIA labels to charts
**Task:** Make data visualizations accessible.
- Add `aria-label` to chart containers describing data.
- Add `role="img"` where appropriate.
- Ensure tooltips have proper ARIA attributes.
- Consider adding accessible data tables as fallback.

**Files:** Chart components

**DoD:** Screen readers can access chart information.

---

### M14.6 — Test with screen reader
**Task:** Verify screen reader compatibility.
- Test with NVDA (Windows) or JAWS.
- Navigate all pages and ensure:
  - All content announced correctly
  - Form labels clear
  - Table structure understood
  - Charts have meaningful descriptions
- Fix any issues found.

**Files:** Various

**DoD:** Full app navigable and understandable with screen reader.

---

### M14.7 — Optimize bundle size
**Task:** Ensure fast loading.
- Run `npm run build` and analyze bundle.
- Verify charts and heavy components lazy-load.
- Check for duplicate dependencies.
- Ensure code splitting working correctly.
- Target: main bundle < 200KB gzipped.

**Files:** `next.config.ts`, component imports

**DoD:** Bundle size acceptable; lazy loading confirmed.

---

### M14.8 — Test responsive layouts
**Task:** Verify mobile and tablet views.
- Test all pages at breakpoints: 320px, 768px, 1024px, 1440px.
- Ensure tables scroll horizontally on small screens.
- Check touch targets (min 44×44px).
- Verify all text readable without zooming.
- Test on real devices if possible.

**Files:** Component styles

**DoD:** App usable on all screen sizes; no layout breaks.

---

## M15 — Polish & Docs

### M15.1 — Add empty states
**Task:** Improve UX for new users.
- Create `components/EmptyState.tsx` reusable component.
- Add empty states for:
  - Main grid (no entries yet) - suggest creating first entry
  - History (no historical data) - explain how to populate
  - Stats (insufficient data) - explain minimum data needed
- Include helpful copy and call-to-action buttons.

**Files:** `components/EmptyState.tsx`, page components

**DoD:** All empty states friendly and actionable.

---

### M15.2 — Add loading skeletons
**Task:** Improve perceived performance.
- Create skeleton components for:
  - Table rows (main grid)
  - Heatmap cells
  - KPI cards
  - Charts
- Use Tailwind animate-pulse.
- Show skeletons while data loads.

**Files:** `components/Skeleton.tsx`, various components

**DoD:** Smooth loading experience; no content jumps.

---

### M15.3 — Improve microcopy
**Task:** Refine all user-facing text.
- Review all labels, buttons, headings, help text.
- Ensure clear, friendly, concise tone.
- Add contextual help tooltips where needed.
- Fix any typos or awkward phrasing.
- Ensure consistent terminology throughout app.

**Files:** All components

**DoD:** All text clear and helpful; consistent voice.

---

### M15.4 — Add toast notifications
**Task:** Provide feedback for user actions.
- Install toast library (e.g., `sonner` or `react-hot-toast`).
- Add toasts for:
  - Save success/failure
  - Export success
  - Import success/failure
  - Settings saved
  - Data cleared
- Style consistently with app theme.

**Files:** Toast provider in layout, action handlers

**DoD:** All major actions have clear feedback.

---

### M15.5 — Write comprehensive README
**Task:** Document the application.
- Update `README.md` with:
  - Project overview and purpose
  - Privacy guarantees (local-only, no telemetry)
  - Features list
  - Data model explanation
  - Clarity Index formula
  - Installation instructions (local dev)
  - Build and deployment steps
  - Backup/export recommendations
  - Troubleshooting section
  - Future enhancements
- Use clear headings and formatting.

**Files:** `README.md`

**DoD:** README complete and helpful for users and contributors.

---

### M15.6 — Add inline documentation
**Task:** Document code for maintainability.
- Add JSDoc comments to:
  - All exported functions in lib/
  - Complex component props
  - Clarity Index calculation functions
  - Database schemas
- Explain non-obvious logic.

**Files:** All lib files, complex components

**DoD:** Code well-documented; easy to understand.

---

### M15.7 — Create screenshots
**Task:** Visual documentation.
- Take screenshots of:
  - Main page (all three tabs)
  - Day detail page
  - History heatmap
  - Stats dashboard
  - Settings page
- Add to `docs/screenshots/` folder.
- Reference in README.

**Files:** `docs/screenshots/*`, `README.md`

**DoD:** Screenshots show all major features.

---

### M15.8 — Final QA pass
**Task:** Test complete user journey.
- Fresh install/clear data.
- Walk through:
  - First launch → default setup
  - Add entries for multiple days
  - View history and stats
  - Customize settings
  - Export data
  - Clear all
  - Import data back
  - Install as PWA
  - Use offline
- Fix any bugs found.
- Verify all features work end-to-end.

**Files:** N/A (testing)

**DoD:** App stable and fully functional; ready for daily use.

---

## Testing Plan (ongoing as functionality lands)

Unit (Jest):
- CI math with caps & clamping; schema validators; timeframe overlap checker; export/import transformers; encryption helpers.

Integration (RTL):
- Main tab totals; detail autosave; settings propagation; heatmap metric toggle.

E2E (Playwright):
- First run → seed timeframes → enter R/C/A + Anxiety/Stress → set Sleep/Exercise → verify stats & history.
- Export JSON → clear → import → data restored.
- Offline edit & reload; PWA install and relaunch.

Accessibility:
- Axe passes; keyboard traversal; chart ARIA labels.

Performance:
- Charts/history lazy‑loaded; Dexie I/O stays snappy.

---

## Dev Notes & Commands

- Install deps (to be added as we wire functionality): `dexie`, `zod`, `date-fns`, `recharts` (or `chart.js`), `next-pwa`.

Run locally:
```bash
npm install
npm run dev
```

Lint/format:
```bash
npm run lint
npm run format --if-present
```

---

## PR Checklist (repeat for each milestone)
- Scope: only the milestone items, no unrelated changes.
- UI: keyboard nav, visible focus, responsive check.
- Tests: updated/added per milestone; all passing.
- A11y: Axe pass, ARIA labels for new components.
- Docs: README/TODO updated where relevant.
- Screenshots: before/after for UI milestones.
