# Cinematic Ember UI Kit - Application Refactoring TODO

**Created:** November 29, 2025  
**Status:** In Progress  
**Goal:** Migrate the entire Mental Clarity application to use the Cinematic Ember UI kit for consistent, cinematic styling.

---

## Overview

This document tracks the migration of all components from the default styling to the Cinematic Ember theme. The Cinematic Ember UI kit provides:
- `EmberShell` - Layout wrapper with background effects
- `EmberCard` - Glowing glass-morphism cards (orange/amber variants)
- `EmberStatCard` - Stat display cards with icons and delta indicators
- `EmberTableContainer` - Table wrapper with themed styling
- `BackgroundEffects` - Cinematic background with animations
- `emberTheme` - Theme configuration and color tokens

**Location:** `ui/cinematic-ember/*`  
**Reference:** `docs/styling-reference-cinematic-ember.md`

---

## 🎯 Phase 1: Core Layout & Views (✅ COMPLETED)

### ✅ Completed
- [x] Root layout integration
  - Add `BackgroundEffects` to `app/layout.tsx`
  - Ensure proper z-index layering

- [x] Home View (`components/views/HomeView.tsx`)
  - Wrap in `EmberShell`
  - Replace header styling with Cinematic Ember typography
  
- [x] Main Page Client (`components/MainPageClient.tsx`)
  - Wrap tab panel in `EmberCard`
  - Update button styling to match theme
  - Consider using `EmberTableContainer` for the grid display

- [x] History View (`components/views/HistoryViewContainer.tsx`)
  - Wrap in `EmberShell`
  - Replace section styling with `EmberCard`
  - Update heatmap container styling

- [x] Stats View (`components/views/StatsViewContainer.tsx`)
  - Wrap in `EmberShell`
  - Replace cards with `EmberCard` or `EmberStatCard`
  - Update chart containers with Ember styling

- [x] Settings View (`components/views/SettingsViewContainer.tsx`)
  - Wrap in `EmberShell`
  - Replace section cards with `EmberCard`
  - Update form styling to match theme

---

## 📋 Phase 2: Component Library (In Progress)

### Primary UI Components
- [x] `components/Navbar.tsx`
  - Apply Cinematic Ember navigation styling
  - Use theme colors for active states
  - Add glass-morphism effects

- [x] `components/Tabs.tsx`
  - Update tab styling with Ember theme colors
  - Apply glow effects to active tabs
  - Match orange/amber accent palette

- [x] `components/MainMetricGrid.tsx`
  - Apply Ember theme to table styling
  - Update table row/cell styling with cinematic colors
  - Apply hover effects from theme

- [x] `components/TimeframeGrid.tsx`
  - Apply Ember table styling with cinematic colors
  - Update header and row colors to match theme

### Data Display Components
- [x] `components/KPICard.tsx`
  - Migrate to `EmberStatCard`
  - Use appropriate variant (orange/amber)
  - Add icon support

- [x] `components/StatsCards.tsx`
  - Replace with `EmberStatCard` instances
  - Distribute orange/amber variants
  - Add appropriate icons

- [x] `components/DailyTotals.tsx`
  - Updated sticky footer with cinematic colors
  - Applied orange/amber badges with borders
  - Added subtle glow shadow

- [x] `components/DailySummary.tsx`
  - Updated text colors to slate-400
  - Applied theme palette to helper text

### Chart Components
- [x] `components/Heatmap.tsx`
  - Update container styling with cinematic colors
  - Update cell colors to match theme
  - Apply glow effects to high-value cells

- [x] `components/HeatmapCell.tsx`
  - Update color mapping for Cinematic Ember palette (orange/amber for good, red for bad)
  - Add subtle glow effects

- [x] `components/BarCharts.tsx` & `components/BarChartsImpl.tsx`
  - Update loading skeleton to cinematic theme
  - Update chart colors to orange/amber palette
  - Apply theme colors to axes and labels
  - Update tooltip styling

- [x] `components/Sparkline.tsx` & `components/SparklineChart.tsx`
  - Update loading skeleton to cinematic theme
  - Update line colors to orange palette
  - Apply glow effects to trend lines
  - Update tooltip styling

- [x] `components/MetricToggle.tsx`
  - Update toggle styling with orange/amber
  - Add glow effects to active state
  - Update borders and backgrounds

### Form Components
- [x] `components/DayDetailForm.tsx`
  - Updated container sections with cinematic colors
  - Applied orange glow to Initialize Day button
  - Updated error and status messages with theme colors

- [x] `components/TimeframeEditor.tsx`
  - Modal with cinematic background and orange glow shadow
  - Updated all input fields with theme styling
  - Orange focus glow effects on inputs
  - Updated buttons with lumina-orange styling

- [x] `components/TimeframeEntryRow.tsx`
  - Updated row hover effects with cinematic colors
  - Applied orange glow on hover
  - White text for labels

- [x] `components/GoalsConfig.tsx`
  - Updated all form inputs with cinematic styling
  - Orange focus glow effects
  - Orange button with glow shadow

- [x] `components/PreferencesConfig.tsx`
  - Updated radio buttons and select with theme colors
  - Orange accent for active states
  - Orange button with glow shadow

- [x] `components/CIConfig.tsx`
  - Updated collapsible section with cinematic styling
  - Orange accent for sliders
  - Updated all number inputs with theme styling
  - Orange buttons with glow effects

- [x] `components/DataManagement.tsx`
  - Updated export/import buttons with cinematic styling
  - Red danger button with proper theme colors
  - Confirmation dialog with cinematic styling and orange glow shadow

### List/Table Components
- [x] `components/TimeframeList.tsx`
  - Updated list items with cinematic backgrounds
  - Applied orange glow hover effects
  - Updated buttons with theme styling
  - Orange accent on Edit button hover
  - Red accent for Delete button

- [x] `components/HistoryView.tsx`
  - Already wrapped in EmberCard with amber variant
  - Typography already updated
  - Complete ✅

---

## 🎨 Phase 3: UI Primitives (shadcn/ui) (✅ COMPLETED)

### Core UI Components
- [x] `components/ui/card.tsx`
  - Already compatible with EmberCard wrapper
  - Base styles work with theme ✅

- [x] `components/ui/Button.tsx`
  - Created Ember button variants (default with orange, subtle, ghost)
  - Added glow effects on hover and focus
  - Matched orange/amber accent palette

- [x] `components/ui/Input.tsx`
  - Updated border and background colors to cinematic theme
  - Added focus glow effects with orange
  - Matched theme color scheme

- [x] `components/ui/textarea.tsx`
  - Applied theme colors (cinematic backgrounds, white text)
  - Added orange focus glow effects

- [x] `components/ui/label.tsx`
  - Updated text colors to slate-300
  - Matches theme palette

- [x] `components/ui/badge.tsx`
  - Created Ember variants (default with orange, outline, muted)
  - Applied glow effects to default variant

- [x] `components/ui/separator.tsx`
  - Updated color to cinematic-800 border color

- [x] `components/ui/skeleton.tsx`
  - Applied Cinematic Ember loading animation
  - Uses cinematic-900/40 background

- [x] `components/ui/tooltip.tsx`
  - Applied glass-morphism effects with backdrop-blur
  - Matched theme colors with orange glow shadow
  - White text on cinematic background

---

## 🔧 Phase 4: Configuration & Utilities

### Style Configuration
- [x] `app/globals.css` - ✅ Added Cinematic Ember CSS variables (OKLCH colors for cinematic-950/900/800, lumina-orange-500/400, lumina-amber-500/400), animations (shooting-star, drift-orb, float-gentle, pulse-glow), shadow-glow utilities (orange/amber variants), text-gradient-orange, glass-morphism classes

- [x] `tailwind.config.ts` - ✅ Extended with all cinematic/lumina color tokens, custom animations (shooting-star, drift-orb, float-gentle, pulse-glow), shadow utilities (glow-orange, glow-amber variants), keyframes definitions, added ui/ to content paths

### Color Utilities
- [x] `lib/colorMapping.ts` - ✅ Updated heatmapColorClass to use Cinematic Ember palette: bg-clarity-high (warm green), bg-lumina-amber-500 (amber), bg-clarity-low (warm red-orange), bg-cinematic-800 (gray)

- [x] `lib/chartConfig.ts` - ✅ Updated CHART_COLORS with Cinematic Ember OKLCH palette: warm green for CI, warm red-orange for rumination, lumina-orange-500 for compulsions, lumina-amber-500 for avoidance, cinematic-800 grid, slate-200 text, added orange/amber accent colors

---

## 📄 Phase 5: Documentation

- [ ] Update README with Cinematic Ember information
- [ ] Create component usage examples
- [ ] Document theme customization options
- [ ] Add migration guide for future components

---

## ⚠️ Important Notes

### DO NOT Change:
- Data logic or business rules
- API routes or data fetching
- Database operations
- Routing structure
- TypeScript types (unless for styling props)

### DO Change:
- Visual styling and CSS classes
- Component wrappers (EmberShell, EmberCard, etc.)
- Color schemes and shadows
- Typography styles
- Animations and transitions
- Layout spacing (to match Ember theme)

### Testing Requirements:
- [ ] Verify all pages render correctly
- [ ] Test responsive behavior on mobile/tablet
- [ ] Confirm animations perform smoothly
- [ ] Validate accessibility (contrast, focus states)
- [ ] Test dark mode compatibility (Ember is dark-first)
- [ ] Check Electron integration still works

---

## 🚀 Success Criteria

The refactoring is complete when:
1. ✅ All pages use EmberShell wrapper
2. ✅ All cards replaced with EmberCard/EmberStatCard
3. ✅ All tables wrapped in EmberTableContainer
4. ✅ BackgroundEffects active at layout level
5. ✅ Consistent color scheme (orange/amber accents)
6. ✅ All animations working smoothly
7. ✅ No visual regressions or broken layouts
8. ✅ All data functionality preserved
9. ✅ TypeScript compiles with no errors
10. ✅ Application passes manual QA testing

---

**Next Steps:**
1. Complete Phase 1 (Core Layout & Views)
2. Test in development environment
3. Fix any visual issues
4. Proceed to Phase 2 (Component Library)
5. Repeat testing and iteration

**Estimated Effort:** 8-12 hours
**Priority:** Medium (visual enhancement, non-breaking)
