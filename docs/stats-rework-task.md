# Stats Rework - Handling Empty/Untracked Days

**Status**: Planning  
**Created**: December 23, 2025  
**Priority**: High - Data Accuracy Issue

## Problem Statement

Current stats calculations treat auto-created empty days (all 0s) as valid data points, which:
- Skews 7-day averages downward artificially
- Makes "Current Streak" meaningless (counts empty days)
- Shows "Today's CI: 0%" for untracked days
- Includes empty days in block averages, diluting real tracking data

With auto-creation enabled, every date accessed creates empty entries, making this issue critical.

**Important**: All 0s is a **good thing** - it means no rumination, compulsions, or avoidance! We need to distinguish between:
- **Perfect tracked day** (user tracked, had all 0s) ✅
- **Auto-created empty day** (not yet tracked) ❌

---

## Core Concept: "Tracked Day" Definition

A day is considered **tracked** if ANY of these are true:

1. **Daily metadata filled**: Sleep quality, exercise minutes, or daily notes entered
2. **Entry modified**: ANY entry has `updatedAt > createdAt` (user interacted with it)
3. **Explicit tracking**: User manually saved any entry (even if left at 0)

**Key insight**: A perfect day with all 0s IS tracked if the user filled out daily summary or touched any entry.

---

## Implementation Plan

### Phase 1: Add `isTrackedDay()` Helper ✅ COMPLETE

**File**: `lib/statsCalc.ts` - **IMPLEMENTED**

```typescript
/**
 * Determine if a day has been actively tracked (vs auto-created empty)
 * A day with all 0s counts as tracked if the user interacted with it.
 */
export function isTrackedDay(
  day: DayAggregates, 
  dailyMeta?: DailyMeta | null,
  entries?: BlockEntry[]
): boolean {
  // Check if daily summary was filled out
  if (dailyMeta) {
    if (dailyMeta.dailyNotes && dailyMeta.dailyNotes.trim().length > 0) return true;
    if (dailyMeta.sleepQuality && dailyMeta.sleepQuality > 0) return true;
    if (dailyMeta.exerciseMinutes && dailyMeta.exerciseMinutes > 0) return true;
  }
  
  // Check if any entry was modified after creation
  // (indicates user saw and saved the entry, even if left at 0)
  if (entries) {
    const dayEntries = entries.filter(e => e.date === day.date);
    const hasModifiedEntries = dayEntries.some(e => {
      const created = new Date(e.createdAt);
      const updated = new Date(e.updatedAt);
      return updated > created;
    });
    if (hasModifiedEntries) return true;
  }
  
  // Fallback: If we can't determine, assume untracked
  return false;
}
```

**Alternative (simpler, more lenient)**:
```typescript
/**
 * Simple version: Any daily metadata = tracked
 */
export function isTrackedDay(dailyMeta?: DailyMeta | null): boolean {
  if (!dailyMeta) return false;
  return (
    (dailyMeta.dailyNotes && dailyMeta.dailyNotes.trim().length > 0) ||
    (dailyMeta.sleepQuality && dailyMeta.sleepQuality > 0) ||
    (dailyMeta.exerciseMinutes && dailyMeta.exerciseMinutes > 0)
  );
}
```

---

### Phase 2: Update Data Fetching ✅ COMPLETE

**File**: `hooks/useStatsData.ts` - **IMPLEMENTED**

Need to fetch daily metadata for all days to determine tracked status:

```typescript
// Current: only fetches entries
const entries = await getEntriesRange(oldest, newest);

// NEW: Also fetch daily metadata
const dailyMetaList = await getDailyMetaRange(oldest, newest);

// Pass to aggregation
const aggregates = aggregateByDate(
  entries, 
  settings.ciWeights, 
  settings.goals, 
  dailyMetaList // NEW
);
```

---

### Phase 3: Update KPI Calculations ✅ COMPLETE

**File**: `lib/statsCalc.ts` - `computeKPIs()` - **IMPLEMENTED**

#### 3.1 Update Function Signature
```typescript
export function computeKPIs(
  days: DayAggregates[], 
  dailyMetaList: DailyMeta[] // NEW
): KPIResult {
  // ...
}
```

#### 3.2 Today's CI
```typescript
const today = days[0];
const todayMeta = dailyMetaList.find(m => m.date === today?.date);
const todayIsTracked = today ? isTrackedDay(todayMeta) : false;

// Show CI if tracked, otherwise null
const todayCI = todayIsTracked ? (today?.dailyCI ?? null) : null;
```

#### 3.3 7-Day Average CI
```typescript
// Only include tracked days in average
const last7 = days.slice(0, 7);
const last7Tracked = last7.filter(d => {
  const meta = dailyMetaList.find(m => m.date === d.date);
  return isTrackedDay(meta);
});

const last7CIs = last7Tracked
  .map(d => d.dailyCI)
  .filter((v): v is number => v != null);

const sevenAvgCI = last7CIs.length ? avg(last7CIs) : null;
const sevenTrackedCount = last7Tracked.length;
```

#### 3.4 Current Streak
```typescript
// Count consecutive tracked days from today
let streak = 0;
for (const d of days) {
  const meta = dailyMetaList.find(m => m.date === d.date);
  if (isTrackedDay(meta)) {
    streak++;
  } else {
    break; // Stop at first untracked day
  }
}
```

#### 3.5 Today's Totals (unchanged, but note)
```typescript
// These stay the same - even 0s are valid tracked values
const todayR = today?.totalR ?? 0;
const todayC = today?.totalC ?? 0;
const todayA = today?.totalA ?? 0;
```

**Updated Return Type**:
```typescript
export interface KPIResult {
  todayR: number;
  todayC: number;
  todayA: number;
  todayCI: number | null; // null if not tracked
  todayIsTracked: boolean; // NEW
  sevenAvgCI: number | null; // null if no tracked days
  sevenTrackedCount: number; // NEW: how many of last 7 were tracked
  streakDays: number;
}
```

---

### Phase 4: Update Block Averages ✅ COMPLETE

**File**: `lib/statsCalc.ts` - `buildBlockAverages()` - **IMPLEMENTED**

```typescript
export function buildBlockAverages(
  days: DayAggregates[], 
  dailyMetaList: DailyMeta[], // NEW
  metric: Metric, 
  span = 7
): Array<{ blockId: string; average: number; trackedDays: number }> {
  // Only include tracked days
  const trackedDays = days.slice(0, span).filter(d => {
    const meta = dailyMetaList.find(m => m.date === d.date);
    return isTrackedDay(meta);
  });
  
  const totals: Record<string, number> = {};
  const counts: Record<string, number> = {};
  
  for (const d of trackedDays) {
    for (const [blockId, block] of Object.entries(d.blockTotals)) {
      if (!totals[blockId]) {
        totals[blockId] = 0;
        counts[blockId] = 0;
      }
      const val = metric === 'R' ? block.R : metric === 'C' ? block.C : block.A;
      totals[blockId] += val;
      counts[blockId]++;
    }
  }
  
  return Object.keys(totals).map(blockId => ({ 
    blockId, 
    average: counts[blockId] > 0 ? Math.round(totals[blockId] / counts[blockId]) : 0,
    trackedDays: counts[blockId]
  }));
}
```

---

### Phase 5: Update Aggregation Function ⏭️ SKIPPED

**File**: `lib/statsCalc.ts` - `aggregateByDate()`

_Note: Not needed - daily metadata is passed separately to computation functions_

```typescript
export function aggregateByDate(
  entries: BlockEntry[],
  ciWeights: CIWeights,
  goals: Goals,
  dailyMetaList?: DailyMeta[] // NEW: optional for backwards compat
): DayAggregates[] {
  // ... existing logic ...
  
  // For each date, attach dailyMeta if available
  const aggregated = dateMap.entries().map(([date, agg]) => {
    const meta = dailyMetaList?.find(m => m.date === date);
    return {
      ...agg,
      dailyMeta: meta // NEW: store for reference
    };
  });
  
  return aggregated;
}
```

**Update DayAggregates type**:
```typescript
export interface DayAggregates {
  date: string;
  totalR: number;
  totalC: number;
  totalA: number;
  avgAnxiety: number;
  avgStress: number;
  dailyCI: number | null;
  blockTotals: Record<string, { R: number; C: number; A: number }>;
  dailyMeta?: DailyMeta; // NEW
}
```

---

### Phase 6: Update UI Components ✅ COMPLETE

#### 6.1 `components/StatsCards.tsx` ✅ COMPLETE

```typescript
const todayR = kpis?.todayR ?? 0;
const todayC = kpis?.todayC ?? 0;
const todayA = kpis?.todayA ?? 0;

// Show CI or "Not tracked yet"
const todayCI = kpis?.todayIsTracked && kpis?.todayCI != null 
  ? formatPercent(kpis.todayCI) 
  : 'Not tracked yet';

const sevenAvg = kpis?.sevenAvgCI != null 
  ? formatPercent(kpis.sevenAvgCI) 
  : '—';

const sevenSubtitle = kpis?.sevenTrackedCount 
  ? `${kpis.sevenTrackedCount} of 7 days tracked`
  : 'No tracked days';

const streak = kpis?.streakDays ?? 0;

// Update KPICard calls:
<KPICard 
  title="Today's Clarity Index" 
  value={todayCI} 
  subtitle={todayCI === 'Not tracked yet' ? 'Fill out daily summary' : '0% worst • 100% best'} 
  colorClassName={todayCI === 'Not tracked yet' ? 'text-zinc-400' : getCIColor(kpis?.todayCI)} 
/>

<KPICard 
  title="7-Day Avg CI" 
  value={sevenAvg} 
  subtitle={sevenSubtitle} 
  colorClassName={sevenAvg === '—' ? 'text-zinc-400' : 'text-emerald-500'} 
/>

<KPICard 
  title="Current Streak" 
  value={`${streak} days`} 
  subtitle={streak > 0 ? 'Keep it up!' : 'Start tracking today'} 
  colorClassName={streak > 0 ? 'text-lumina-orange-500' : 'text-zinc-400'} 
/>
```

#### 6.2 `components/StatsView.tsx` (Block Averages) ✅ COMPLETE

```typescript
<h2 className="text-lg font-medium text-white">
  By Timeframe 
  {kpis?.sevenTrackedCount != null && (
    <span className="text-sm text-zinc-400 font-normal ml-2">
      ({kpis.sevenTrackedCount} of 7 days tracked)
    </span>
  )}
</h2>
```

---

### Phase 7: Update Hook ✅ COMPLETE

**File**: `hooks/useStatsData.ts` - **IMPLEMENTED**

```typescript
// Fetch both entries and daily metadata
const [entries, dailyMetaList] = await Promise.all([
  getEntriesRange(oldest, newest),
  getDailyMetaRange(oldest, newest)
]);

// Pass dailyMetaList to aggregation
const aggregates = aggregateByDate(entries, weights, goals, dailyMetaList);

// Pass to computeKPIs
const kpiResults = computeKPIs(aggregates, dailyMetaList);

// Pass to buildBlockAverages
const rawBlockAvgs = buildBlockAverages(aggregates, dailyMetaList, barMetric, 7);
```

---

## Testing Checklist

- [ ] Auto-created day shows "Not tracked yet" for Today's CI
- [ ] Filling out daily summary (sleep/exercise/notes) marks day as tracked
- [ ] Day with all 0s + filled daily summary shows CI (not "Not tracked yet")
- [ ] 7-day average excludes untracked days
- [ ] "X of 7 days tracked" subtitle shows correct count
- [ ] Streak only counts consecutive tracked days
- [ ] Streak stops at first untracked day
- [ ] Block averages exclude untracked days
- [ ] Sparkline behavior (decide if we show untracked days as gaps or 0s)
- [ ] Perfect day (all 0s + tracked) shows 100% CI

---

## Edge Cases

### What if user tracks entries but not daily summary?
- **Decision**: Day is untracked (CI can't be computed without sleep/exercise)
- **Rationale**: CI requires daily metadata, so we need it for a valid tracked day
- **Alternative**: Check if entries were modified (`updatedAt > createdAt`) - more complex

### What if user only fills out daily notes?
- **Behavior**: Counts as tracked
- **Rationale**: User intentionally documented the day

### What about partial days?
- **Behavior**: Entire day counts as tracked if daily summary is filled
- **Block averages**: All blocks included if day is tracked (even if some are 0)

---

## Success Criteria

✅ Empty auto-created days don't skew averages  
✅ Today's CI shows "Not tracked yet" until daily summary filled  
✅ Perfect days (all 0s) show 100% CI when tracked  
✅ 7-day average only includes tracked days  
✅ Streak counts meaningful consecutive tracking  
✅ Block averages reflect actual usage patterns  
✅ UI clearly indicates incomplete/missing data  

---

## Migration Notes

- **Backwards compatible**: Existing data unaffected
- **No database changes**: Pure calculation logic update
- **Requires daily metadata**: Must fetch `getDailyMetaRange()` in stats hook
- **Type updates**: `KPIResult` interface expanded

---

## Future Enhancements

### ✅ Tracking Completion Indicator - IMPLEMENTED
**File**: `components/DayDetailForm.tsx`

Added visual banner when viewing untracked days:
- Orange info alert at top of day detail form
- Explains daily summary needs to be filled
- Guides user to Daily Summary section
- Auto-hides once day is tracked
- Uses `isTrackedDay()` helper for detection

### ✅ Smart Prompts - IMPLEMENTED
**Files**: `components/TrackingReminder.tsx`, `app/layout.tsx`, `app/globals.css`

Added smart notification system for tracking reminders:
- **Timing**: Shows after 6 PM if today isn't tracked
- **Appearance**: Animated slide-up notification in bottom-right corner
- **Actions**: "Track Now" button (navigates to today) or "Later" to dismiss
- **Persistence**: Remembers dismissal for the day (localStorage)
- **Auto-check**: Checks every 30 minutes
- **Styling**: Cinematic-ember theme with orange glow
- **Accessibility**: Proper ARIA labels and semantic HTML

**Implementation details:**
- Created `TrackingReminder` component with time-based logic
- Added slide-up animation to global CSS
- Integrated into root layout for app-wide coverage
- Uses `getDailyMeta()` and `isTrackedDay()` for detection
- Dismissal persists per-day in localStorage

### Pending Enhancements

- **Tracking stats**: "You've tracked 5 of the last 7 days (71%)"
- **Smart prompts**: "Don't forget to track today!" notification
- **Goal tracking**: "Tracked every day this week! 🎉"
- **Entry modification check**: Use `updatedAt > createdAt` to detect user interaction

---

## Notes

- **Simplicity vs Accuracy**: Starting with "daily summary = tracked" approach
  - Simpler to implement and understand
  - Encourages users to fill out sleep/exercise (needed for CI anyway)
  - Can enhance later with entry modification detection if needed

- **CI Calculation**: Already depends on daily metadata, so this aligns well

- **User Experience**: "Not tracked yet" is clearer than showing 0% for empty days
