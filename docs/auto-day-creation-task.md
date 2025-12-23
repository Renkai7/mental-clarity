# Auto-Creation of Days - Implementation Task

**Status**: Planning  
**Created**: December 23, 2025  
**Priority**: High - UX Enhancement

## Problem Statement

Currently, users must manually initialize days before they can track data. This creates friction in the daily tracking workflow and is unintuitive for new users.

## Solution

Implement automatic day creation when users navigate to any date. Days will be created on-demand with empty entries for all active timeframes.

---

## Implementation Plan

### Phase 1: Core Auto-Creation Logic ✅ COMPLETE

**File**: `lib/dbUtils.ts` - **IMPLEMENTED**

Modify `getEntriesForDate()` to auto-create empty days:

```typescript
export async function getEntriesForDate(date: string): Promise<BlockEntry[]> {
  DateString.parse(date);
  const entries = await api.getEntriesForDate(date);
  
  // Auto-create day if no entries exist
  if (entries.length === 0) {
    await createEmptyDay(date);
    const newEntries = await api.getEntriesForDate(date);
    return newEntries.map((e) => BlockEntrySchema.parse(e));
  }
  
  entries.sort((a, b) => a.blockId.localeCompare(b.blockId));
  return entries.map((e) => BlockEntrySchema.parse(e));
}
```

**Benefits**:
- Transparent to all consumers (hooks, components)
- Works for any date navigation method
- Idempotent (createEmptyDay uses ON CONFLICT DO NOTHING)
- Single DB transaction, negligible performance impact

---

### Phase 2: Test Auto-Creation 🔄

**Actions**:
1. Test date picker navigation (prev/next day)
2. Test direct URL access (`/day/YYYY-MM-DD`)
3. Test today's date on app launch
4. Test historical dates via calendar/heatmap
5. Test future dates
6. Verify entries created with default values (R:0, C:0, A:0, anxiety:5, stress:5)
7. Test with modified timeframe configurations

**Files to Monitor**:
- `hooks/useDayData.ts` - Day data loading
- `components/views/HomeView.tsx` - Initial load
- `components/MainPageClient.tsx` - Navigation
- `app/day/[date]/page.tsx` - Direct URL access

---

### Phase 3: Remove Manual Initialization UI ✅ COMPLETE

**After successful testing, remove or simplify**:

#### Files Updated:

1. **`components/DayDetailForm.tsx`** ✅
   - Removed "Initialize Day" button and conditional logic
   - Always shows TimeframeGrid (entries auto-created)
   - Removed `initializeDay` from useDayData destructuring

2. **`hooks/useDayData.ts`**
   - Keep `initializeDay()` function for backwards compatibility
   - OR remove if no longer needed
   - Update documentation to note auto-creation

3. **Recently Moved "Start Tracking" Button**
   - Location: [VERIFY CURRENT LOCATION]
   - Decision: Remove entirely or repurpose for different action
   - Check if button provides any value beyond auto-creation

4. **Related Components** (verify current usage):
   - `components/MainPageClient.tsx`
   - `components/views/HomeView.tsx`
   - Any modal/overlay components for initialization

---

## Edge Cases & Considerations

### ✅ Handled by Current Implementation
- **Inactive timeframes**: Only active blocks get entries (line 228-232 in `db/sqlite.js`)
- **Duplicate creation**: `ON CONFLICT DO NOTHING` prevents duplicates
- **Concurrent access**: SQLite transactions ensure atomicity

### ⚠️ To Consider
- **Changed timeframe configurations**: 
  - Old dates keep their existing entries
  - New blocks won't auto-add to historical dates (by design)
  - Users can manually add/edit if needed

- **Performance**:
  - Single transaction per day creation
  - Minimal overhead (~6 inserts per day with default config)
  - No batch operations needed

- **Data consistency**:
  - All entries start with default values
  - Maintains existing entry preservation logic
  - No data loss risk

---

## Testing Checklist

- [ ] Navigate to today's date → entries created
- [ ] Navigate to yesterday → entries created
- [ ] Navigate to future date (next week) → entries created
- [ ] Navigate via date picker → entries created
- [ ] Direct URL access → entries created
- [ ] Verify default values (R:0, C:0, A:0, anxiety:5, stress:5)
- [ ] Verify all active timeframes have entries
- [ ] Verify inactive timeframes are skipped
- [ ] Test with custom timeframe configuration
- [ ] Test after modifying timeframes (old dates unaffected)
- [ ] Verify existing days are not modified
- [ ] Test in Electron desktop app
- [ ] Test in web version (if applicable)

---

## Rollback Plan

If issues arise:
1. Revert `lib/dbUtils.ts` changes
2. Restore manual initialization buttons
3. Document issues for future iteration

---

## Success Criteria

✅ Users can navigate to any date and immediately see tracking UI  
✅ No "Initialize Day" or "Start Tracking" prompts required  
✅ Existing data remains intact  
✅ Performance is unaffected  
✅ All tests pass  

---

## Future Enhancements (Optional)

- **Bulk pre-creation**: Option to pre-create next N days on app launch
- **Smart defaults**: Pre-fill based on historical patterns
- **Notification**: Gentle reminder if today's data is empty at end of day
- **Settings toggle**: Option to disable auto-creation (power users)

---

## Notes

- Recent button move: Verify current location of "Start Tracking" button before removal
- Backwards compatibility: Keep `initializeDay()` export for any external consumers
- Documentation: Update README/user guides to reflect automatic behavior
