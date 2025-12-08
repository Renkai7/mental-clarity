# Commit Plan for Mental Clarity Changes

This document organizes all uncommitted changes into logical branches and commits for structured integration into main.

---

## Branch 1: `ci/add-pr-checks`
**Purpose:** Add CI/CD pipeline for PR validation

### Files
- `.github/workflows/pr-checks.yml` (new)

### Commits
```bash
git checkout -b ci/add-pr-checks
git add .github/workflows/pr-checks.yml
git commit -m "ci: add PR checks workflow for pull requests

- Add linting and type checking job
- Add unit test execution
- Add Next.js build verification
- Add Electron build verification for Windows
- All checks must pass before PR can merge"
git push -u origin ci/add-pr-checks
```

---

## Branch 2: `test/add-db-test-suite`
**Purpose:** Add comprehensive database test coverage

### Files
- `tests/db/db-sqlite.init.test.ts` (new)
- `tests/db/db-sqlite.entries.test.ts` (new)
- `tests/db/db-sqlite.blocks.test.ts` (new)
- `tests/db/db-sqlite.daily-meta.test.ts` (new)
- `tests/db/db-sqlite.settings.test.ts` (new)
- `tests/db/db-sqlite.create-empty-day.test.ts` (new)
- `tests/db/db-sqlite.advanced.test.ts` (new)
- `tests/helpers/db-test-setup.ts` (new)
- `tests/helpers/test-db.ts` (new)
- `db/sqlite.js.backup` (new - backup)

### Commits
```bash
git checkout -b test/add-db-test-suite
git add tests/db/ tests/helpers/ db/sqlite.js.backup
git commit -m "test: add comprehensive SQLite database test suite

- Add test helpers for database setup and teardown
- Add tests for database initialization and schema
- Add tests for CRUD operations on entries
- Add tests for blocks and daily metadata
- Add tests for settings management
- Add advanced query and edge case tests
- All tests follow TDD principles with clear Given/When/Then structure"
git push -u origin test/add-db-test-suite
```

---

## Branch 3: `refactor/update-components-typescript`
**Purpose:** Update all components with improved TypeScript and type safety

### Files
- `components/BarCharts.tsx`
- `components/BarChartsImpl.tsx`
- `components/CIConfig.tsx`
- `components/DailySummary.tsx`
- `components/DailyTotals.tsx`
- `components/DataManagement.tsx`
- `components/DayDetailForm.tsx`
- `components/GoalsConfig.tsx`
- `components/Heatmap.tsx`
- `components/HeatmapCell.tsx`
- `components/HistoryView.tsx`
- `components/MainMetricGrid.tsx`
- `components/MainPageClient.tsx`
- `components/MetricToggle.tsx`
- `components/Navbar.tsx`
- `components/PreferencesConfig.tsx`
- `components/SettingsView.tsx`
- `components/Sparkline.tsx`
- `components/SparklineChart.tsx`
- `components/StatsView.tsx`
- `components/Tabs.tsx`
- `components/TimeframeEditor.tsx`
- `components/TimeframeEntryRow.tsx`
- `components/TimeframeGrid.tsx`
- `components/TimeframeList.tsx`

### Commits
```bash
git checkout -b refactor/update-components-typescript
git add components/*.tsx
git commit -m "refactor: improve TypeScript types and component structure

- Add explicit type definitions for all component props
- Improve prop validation and default values
- Enhance type safety across all main components
- Remove any type assertions
- Add JSDoc comments where needed for clarity"
git push -u origin refactor/update-components-typescript
```

---

## Branch 4: `refactor/update-ui-components`
**Purpose:** Refactor UI component library with better types

### Files
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/badge.tsx`
- `components/ui/card.tsx`
- `components/ui/label.tsx`
- `components/ui/separator.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/textarea.tsx`
- `components/ui/tooltip.tsx`

### Commits
```bash
git checkout -b refactor/update-ui-components
git add components/ui/
git commit -m "refactor: enhance UI component library types

- Add proper TypeScript interfaces for all UI components
- Improve prop forwarding and ref handling
- Enhance accessibility attributes
- Standardize component API patterns"
git push -u origin refactor/update-ui-components
```

---

## Branch 5: `refactor/update-view-containers`
**Purpose:** Update view container components

### Files
- `components/views/HistoryViewContainer.tsx`
- `components/views/HomeView.tsx`
- `components/views/SettingsViewContainer.tsx`
- `components/views/StatsViewContainer.tsx`

### Commits
```bash
git checkout -b refactor/update-view-containers
git add components/views/
git commit -m "refactor: improve view container components

- Add proper type definitions for view props
- Enhance state management patterns
- Improve data fetching and loading states
- Add error boundary support"
git push -u origin refactor/update-view-containers
```

---

## Branch 6: `feat/add-cinematic-ember-ui`
**Purpose:** Add new Cinematic Ember UI library

### Files
- `ui/cinematic-ember/` (new directory)
- `docs/cinematic-ember-refactoring-todo.md` (new)
- `docs/styling-reference-cinematic-ember.md` (new)

### Commits
```bash
git checkout -b feat/add-cinematic-ember-ui
git add ui/cinematic-ember/ docs/cinematic-ember-refactoring-todo.md docs/styling-reference-cinematic-ember.md
git commit -m "feat: add Cinematic Ember UI component library

- Add EmberCard, EmberStatCard, EmberCTAButton components
- Add BackgroundEffects for visual enhancement
- Add EmberShell layout wrapper
- Add EmberTableContainer for data display
- Include theme configuration and color system
- Add documentation for refactoring and styling reference"
git push -u origin feat/add-cinematic-ember-ui
```

---

## Branch 7: `refactor/update-lib-utilities`
**Purpose:** Improve library utilities and helper functions

### Files
- `lib/chartConfig.ts`
- `lib/colorMapping.ts`
- `lib/statsCalc.ts`

### Commits
```bash
git checkout -b refactor/update-lib-utilities
git add lib/chartConfig.ts lib/colorMapping.ts lib/statsCalc.ts
git commit -m "refactor: enhance library utilities and types

- Improve chart configuration type safety
- Enhance color mapping utilities
- Refactor statistics calculation functions
- Add comprehensive JSDoc documentation"
git push -u origin refactor/update-lib-utilities
```

---

## Branch 8: `chore/update-config-and-assets`
**Purpose:** Update configuration files and add assets

### Files
- `.gitignore`
- `app/globals.css`
- `app/layout.tsx`
- `next.config.ts`
- `package.json`
- `package-lock.json`
- `tailwind.config.ts`
- `assets/` (new)
- `mental-clarity-icon.png` (new)

### Commits
```bash
git checkout -b chore/update-config-and-assets
git add .gitignore next.config.ts tailwind.config.ts
git commit -m "chore: update project configuration files

- Update .gitignore with new patterns
- Configure Next.js for Electron compatibility
- Enhance Tailwind config with custom theme"

git add app/globals.css app/layout.tsx
git commit -m "style: update global styles and root layout

- Improve global CSS with new design tokens
- Update root layout with better structure"

git add package.json package-lock.json
git commit -m "chore: update dependencies and scripts

- Add new development dependencies
- Update test scripts and build commands
- Add Vitest for testing"

git add assets/ mental-clarity-icon.png
git commit -m "chore: add project assets and branding

- Add application icon
- Include assets directory for static resources"

git push -u origin chore/update-config-and-assets
```

---

## Branch 9: `refactor/update-database-and-electron`
**Purpose:** Database and Electron improvements

### Files
- `db/sqlite.js`
- `electron/main.js`
- `scripts/generate-static-out.js`

### Commits
```bash
git checkout -b refactor/update-database-and-electron
git add db/sqlite.js
git commit -m "refactor: improve SQLite database implementation

- Enhance query methods with better error handling
- Add transaction support
- Improve type safety for database operations"

git add electron/main.js scripts/generate-static-out.js
git commit -m "refactor: update Electron configuration and build scripts

- Improve Electron main process setup
- Enhance static output generation script
- Better integration with Next.js"

git push -u origin refactor/update-database-and-electron
```

---

## Branch 10: `docs/update-documentation`
**Purpose:** Update project documentation

### Files
- `docs/TODO.md`
- `migration-plan.md` (new)
- Deleted: `docs/Example image 1.webp`
- Deleted: `docs/Example image 2.webp`

### Commits
```bash
git checkout -b docs/update-documentation
git add docs/TODO.md migration-plan.md
git rm "docs/Example image 1.webp" "docs/Example image 2.webp"
git commit -m "docs: update project documentation

- Update TODO list with current priorities
- Add migration plan for architecture changes
- Remove outdated example images"

git push -u origin docs/update-documentation
```

---

## Branch 11: `chore/add-agent-configs`
**Purpose:** Add AI agent configuration files

### Files
- `.github/agents/software-engineer.agent.md` (new)
- `.github/agents/tdd-migration.agent.md` (new)

### Commits
```bash
git checkout -b chore/add-agent-configs
git add .github/agents/
git commit -m "chore: add AI agent configuration files

- Add software engineer agent configuration
- Add TDD migration agent configuration
- Support for GitHub Copilot workspace agents"

git push -u origin chore/add-agent-configs
```

---

## Merge Order Recommendation

1. **ci/add-pr-checks** - Set up pipeline first
2. **test/add-db-test-suite** - Establish test infrastructure
3. **refactor/update-lib-utilities** - Foundation utilities
4. **refactor/update-ui-components** - UI building blocks
5. **feat/add-cinematic-ember-ui** - New UI library
6. **refactor/update-components-typescript** - Component improvements
7. **refactor/update-view-containers** - View layer
8. **refactor/update-database-and-electron** - Backend updates
9. **chore/update-config-and-assets** - Configuration
10. **docs/update-documentation** - Documentation
11. **chore/add-agent-configs** - Agent configs

Each branch should be merged via PR after passing all checks.
