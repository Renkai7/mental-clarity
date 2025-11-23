# UI Styling TODO — Mindfulness Theme

Palette reference (light → dark):
- Primary: #2E5B5B → #6BAF9A (hover: #4B8B8B, pressed: #1F3A3D)
- Accent: #A4D8E1 → #4B8B8B
- Surface: #FFFFFF → #0F1617 | Surface-muted: #F5FAFA → #0C1415
- Border: #D7E7E7 → #2A3C3C | Ring: #6BAF9A
- Text: #1F3A3D → #E6F2F2 | Text-muted: #4B6B6B → #BFD9D6

---

## Tokens & Theme
- [x] Define semantic CSS variables in `app/globals.css` (`--primary`, `--primary-foreground`, `--accent`, `--surface`, `--surface-muted`, `--border`, `--ring`, `--text`, `--text-muted`).
- [x] Map variables to Tailwind via `@theme inline` (`--color-*`, `--radius`, `--shadow`), keep clarity scale as separate semantic set.
- [ ] Add base radii (`--radius: 0.5rem`), shadows (calm `shadow-sm` default), and spacing rhythm.
- [x] Set dark-mode counterparts for all tokens and verify system media query behavior.

## Shell & Navigation
- [x] Navbar (`components/Navbar.tsx`): use `bg-surface/85`, `border-surface`, active link `text-primary`, and `focus-visible:ring-[--ring]`.
- [x] App shell backgrounds in `app/page.tsx`: `bg-surface` light, `bg-[--background]` dark alignment.

## Tabs & Panels
- [x] Tabs (`components/Tabs.tsx`): active `bg-accent/10 border-primary text-[--text]`; focus ring uses `--ring`.
- [x] Panels (`components/MainPageClient.tsx`): card surface `bg-surface border-surface rounded-lg shadow-sm`.

## Tables (Main Grid & Day Detail)
- [x] Headers: `bg-surface-muted text-[--text]` with calm contrast.
- [x] Rows: zebra with subtle `bg-surface/[.5]`; sticky first column keeps background in sync.
- [x] Focus: row `focus-visible:ring-2 ring-[--ring] ring-offset-1 ring-offset-surface`.
- [x] Controls: primitives created and applied to `TimeframeEntryRow` and `MainMetricGrid`; `DailySummary` also using primitives.

## Inputs & Controls
- [x] Replace ad-hoc buttons/inputs in `DailySummary.tsx` with consistent primitives (size, radius, ring, disabled, hover).
- [x] Ensure numeric steppers have 40px+ hit targets; use `tabular-nums` where appropriate.
- [ ] Apply tokens to placeholders, help text, and error states.

## Shadcn/UI Adoption (targeted)
- [x] Decide approach: B) copy curated local components aligned to tokens.
- [x] Scaffold `components/ui`: `button`, `input`, `textarea`, `label`, `card`, `separator`, `badge`, `skeleton`, `tooltip` (dialog/switch/slider later).
- [x] Add `Toaster` (sonner) and `TooltipProvider` in `app/layout.tsx`.
- [ ] Refactor high-ROI screens: `DailySummary` (forms), `Settings*` forms, `TimeframeEditor` (dialog), `HistoryView` action buttons.

## Charts & Visualization
- [ ] Update `lib/chartConfig.ts` to derive colors from tokens (CI line = primary deep teal; grid/text from theme).
- [ ] Update `SparklineChart.tsx` / `BarChartsImpl.tsx` to use config; validate tooltip backgrounds for light/dark.
- [ ] Keep CI/heatmap traffic-light semantics; only soften hover/focus visuals.

## Heatmap Polish
- [ ] `HeatmapCell.tsx`: unify rounding, soften hover (no harsh luminance jump), `focus-visible:ring-[--ring]`.
- [ ] `Heatmap.tsx`: button styles for Load More using tokens.

## Accessibility & QA
- [ ] Axe pass (Home, History, Stats, Day, Settings) — zero critical violations.
- [ ] WCAG AA checks for text on `surface` and `surface-muted`, and for primary/disabled states.
- [ ] Keyboard traversal: ensure visible focus on all interactive elements; test Enter/Space activation on grid rows.
- [ ] Add lightweight loading skeletons for grid/charts with `bg-surface-muted animate-pulse`.

## Documentation
- [ ] Document token meanings and usage in this repo (`docs/styling-todo.md` top section) and reference in `docs/TODO.md` M15.9.
- [ ] Note any component-specific guidelines (e.g., avoid `next/dynamic { ssr:false }` in Server Components).

---

### Definition of Done (Styling Initiative)
- Tokens applied across shell, panels, forms, and tables with light/dark support.
- Key screens (Home, Day, History, Stats, Settings) visually consistent and accessible (AA contrast + keyboard focus).
- Charts reflect theme while preserving semantic traffic-light colors for CI messaging.
- Minimal bundle impact; no functional regressions.
