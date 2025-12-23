# Pre-Release Testing Checklist - v1.3.6

**Date**: December 23, 2025  
**Tester**: _____________  
**Environment**: Production Build

---

## Critical Path Testing

### 1. Day Auto-Creation ✅
**Objective**: Verify days are automatically created when navigating to any date

**Steps**:
1. Open the application
2. Navigate to today's date (if not already there)
3. Verify timeframe grid appears immediately with all blocks
4. Click "Previous Day" button
5. Verify yesterday's date loads with empty entries
6. Navigate to a future date (e.g., next week)
7. Verify future date loads with empty entries

**Expected Results**:
- ✅ No "Initialize Day" button appears
- ✅ All active timeframes show with default values (R:0, C:0, A:0, Anxiety:5, Stress:5)
- ✅ No loading errors or delays
- ✅ Daily summary section is visible

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

### 2. Track This Day Button ✅
**Objective**: Verify manual day tracking works correctly

**Steps**:
1. Navigate to today's date
2. Verify "Day not tracked yet" banner appears at top
3. Click "Track This Day" button in the banner
4. Wait 2 seconds for UI to update

**Expected Results**:
- ✅ "Day not tracked yet" banner disappears immediately
- ✅ No errors in console
- ✅ Page reloads data successfully
- ✅ Banner does not reappear

**Follow-up Test**:
1. Refresh the page or navigate away and back
2. Verify tracked status persists
3. Banner should NOT reappear

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

### 3. Entry Field Updates (Timeframe Grid) ✅
**Objective**: Verify all numeric fields save correctly

**Test 3a: Rumination, Compulsions, Avoidance**

**Steps**:
1. Navigate to today's date
2. Find the first timeframe row
3. Enter "5" in Rumination field
4. Tab to Compulsions field
5. Enter "3" in Compulsions field
6. Tab to Avoidance field
7. Enter "2" in Avoidance field
8. Wait 1 second (debounce delay)
9. Verify "All changes saved" appears
10. Refresh the page

**Expected Results**:
- ✅ Values persist after refresh
- ✅ Rumination shows: 5
- ✅ Compulsions shows: 3
- ✅ Avoidance shows: 2
- ✅ Daily totals at bottom update correctly

**Test 3b: Anxiety and Stress Scores**

**Steps**:
1. In the same timeframe row
2. Change Anxiety from 5 to 8
3. Change Stress from 5 to 7
4. Wait 1 second
5. Verify "All changes saved" appears
6. Refresh the page

**Expected Results**:
- ✅ Anxiety persists at: 8
- ✅ Stress persists at: 7
- ✅ Values are within valid range (1-10)

**Test 3c: Edge Cases**

**Steps**:
1. Try to enter "0" in Anxiety field
2. Field should auto-correct to "1" (minimum)
3. Try to enter "15" in Anxiety field
4. Field should cap at "10" (maximum)
5. Clear a field completely and blur
6. Field should reset to default (1 for scores)
7. For Rumination/Compulsions/Avoidance, clearing should set to 0

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

### 4. Daily Summary Updates ✅
**Objective**: Verify sleep, exercise, and notes save correctly

**Steps**:
1. Scroll to Daily Summary section
2. Set Sleep Quality to "9" (use +/- buttons or type)
3. Set Exercise Minutes to "45"
4. Enter "Feeling great today!" in Daily Notes
5. Wait 1 second (debounce)
6. Verify "All changes saved" appears
7. Refresh the page

**Expected Results**:
- ✅ Sleep Quality persists at: 9
- ✅ Exercise Minutes persists at: 45
- ✅ Daily Notes persists: "Feeling great today!"
- ✅ Values don't revert to defaults

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

### 5. Stats Page - Tracked Days ✅
**Objective**: Verify stats correctly filter tracked vs untracked days

**Setup**:
1. Create 3 test days with the following:
   - **Day 1 (2 days ago)**: Mark as tracked, add R=5, C=3, A=2, Sleep=8
   - **Day 2 (yesterday)**: DON'T track, leave all zeros
   - **Day 3 (today)**: Mark as tracked, add R=0, C=0, A=0, Sleep=9

**Steps**:
1. Navigate to Stats page
2. Check "Today's Clarity Index" card
3. Check "7-Day Avg CI" card
4. Check "Current Streak" card
5. Check the sparkline chart
6. Check the block averages

**Expected Results**:
- ✅ Today's CI shows calculated value (not 0%)
- ✅ Today's CI is NOT "—" or "Not tracked yet"
- ✅ 7-Day Avg CI shows "2 of 7 days tracked" (only Day 1 and Day 3)
- ✅ 7-Day Avg excludes Day 2 (untracked) from calculation
- ✅ Current Streak shows "2 days" (Day 1 and Day 3)
- ✅ Sparkline shows data for all days (tracked = calculated, untracked = 0)
- ✅ Block averages only include tracked days

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

### 6. Smart Evening Reminder ✅
**Objective**: Verify notification appears after 6 PM if day isn't tracked

**Setup**:
- Ensure your system clock is after 6:00 PM
- OR temporarily modify the code to test earlier

**Steps**:
1. Launch the app after 6 PM
2. DON'T track today
3. Wait 30 seconds (first check interval)
4. Look for notification in bottom-right corner

**Expected Results**:
- ✅ Notification slides up from bottom-right
- ✅ Shows message: "Don't forget to track your day!"
- ✅ Has "Track Now" button (orange)
- ✅ Has "Later" button (gray)
- ✅ Clicking "Track Now" navigates to today's page
- ✅ Clicking "Later" dismisses notification
- ✅ After dismissing, notification doesn't reappear until next day

**If Before 6 PM**:
- ⬜ Notification should NOT appear
- ⬜ No errors in console

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

### 7. Home Page Tracker ✅
**Objective**: Verify recent days auto-create and display correctly

**Steps**:
1. Navigate to Home page (default view)
2. Observe the main metric grid/tracker
3. Verify last 30 days are visible
4. Click on a date from last week
5. Verify it has entries

**Expected Results**:
- ✅ Last 30 days are pre-created (no gaps)
- ✅ Each day shows in the tracker
- ✅ Clicking a day navigates to detail page
- ✅ Day detail page has entries created
- ✅ No "Initialize Day" prompts

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

### 8. Auto-Updater ✅
**Objective**: Verify automatic updates work correctly

**Prerequisites**:
- Must be running installed desktop app (not dev mode)
- Must have internet connection
- Must have an older version installed (or test with mock update)

**Steps**:
1. Open Settings page
2. Click "Check for Updates" button
3. Wait for response

**Expected Results**:
- ✅ No authentication errors
- ✅ Shows "You are running the latest version" OR
- ✅ Shows "Update available: vX.X.X"
- ✅ If update available, "Download Update" button appears
- ✅ Clicking "Download Update" downloads without errors
- ✅ After download, "Install and Restart" prompt appears

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

### 9. What's New / Changelog ✅
**Objective**: Verify changelog loads from GitHub

**Steps**:
1. Open Settings page
2. Click "What's New" button
3. Wait for changelog to load

**Expected Results**:
- ✅ Changelog loads without "internet connection" error
- ✅ Shows list of recent releases
- ✅ Each release shows version number and date
- ✅ Release notes are formatted correctly
- ✅ Links in release notes are clickable

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

### 10. Data Persistence Across Sessions ✅
**Objective**: Verify all data persists after app restart

**Steps**:
1. Complete tests 2-4 above (track day, add entries, add daily summary)
2. Close the application completely
3. Reopen the application
4. Navigate to the test day

**Expected Results**:
- ✅ Day is still marked as tracked
- ✅ All R/C/A values persist
- ✅ All anxiety/stress scores persist
- ✅ Sleep quality persists
- ✅ Exercise minutes persist
- ✅ Daily notes persist
- ✅ Stats reflect the persisted data

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

## Regression Testing

### 11. Navigation ✅
- ⬜ Date picker works
- ⬜ Previous/Next day buttons work
- ⬜ Clicking logo returns to home
- ⬜ Tab navigation works (Home/History/Stats/Settings)

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

### 12. Settings Page ✅
- ⬜ Timeframe editing still works
- ⬜ Goals configuration still works
- ⬜ CI configuration still works
- ⬜ Saving settings persists

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

### 13. History/Heatmap ✅
- ⬜ Heatmap displays correctly
- ⬜ Clicking dates navigates to day detail
- ⬜ Colors reflect CI values correctly
- ⬜ Tooltip shows correct data

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

## Performance Testing

### 14. Load Times ✅
- ⬜ App launches in < 3 seconds
- ⬜ Page navigation is instant
- ⬜ No lag when typing in fields
- ⬜ Stats page loads in < 2 seconds

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

## Error Handling

### 15. Edge Cases ✅
- ⬜ Navigating to dates far in past works
- ⬜ Navigating to dates far in future works
- ⬜ Invalid date inputs are handled gracefully
- ⬜ Network errors show user-friendly messages
- ⬜ Database errors don't crash the app

**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________

---

## Final Checklist Before Release

- ⬜ All automated tests pass (`npm run test`)
- ⬜ Build completes without errors (`npm run build`)
- ⬜ No console errors in production build
- ⬜ No TypeScript errors
- ⬜ All critical paths tested manually (tests 1-10)
- ⬜ Regression tests pass (tests 11-13)
- ⬜ Performance is acceptable (test 14)
- ⬜ Edge cases handled (test 15)
- ⬜ Version number updated correctly
- ⬜ Release notes written
- ⬜ GitHub Actions workflow completes successfully

---

## Known Issues / Limitations

_(Document any known issues that are acceptable for this release)_

---

## Sign-Off

**Tested By**: _____________  
**Date**: _____________  
**Approved for Release**: ⬜ Yes / ⬜ No

**Additional Notes**:
