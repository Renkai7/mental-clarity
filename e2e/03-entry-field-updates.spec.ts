import { test, expect } from '@playwright/test';

/**
 * Critical Path Test 3: Entry Field Updates
 * 
 * Verifies that all numeric fields in the timeframe grid save correctly
 * and persist across page reloads.
 */
test.describe('Entry Field Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should save and persist Rumination, Compulsions, Avoidance counts', async ({ page }) => {
    // Find the first timeframe row
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    
    // Fill in Rumination field
    const ruminationInput = firstRow.locator('input[aria-label*="Rumination"]');
    await ruminationInput.clear();
    await ruminationInput.fill('5');
    
    // Fill in Compulsions field
    const compulsionsInput = firstRow.locator('input[aria-label*="Compulsions"]');
    await compulsionsInput.clear();
    await compulsionsInput.fill('3');
    
    // Fill in Avoidance field
    const avoidanceInput = firstRow.locator('input[aria-label*="Avoidance"]');
    await avoidanceInput.clear();
    await avoidanceInput.fill('2');
    
    // Wait for autosave (600ms debounce + network)
    await page.waitForTimeout(2000);
    
    // Verify "All changes saved" message appears
    await expect(page.locator('text=/all changes saved/i')).toBeVisible({ timeout: 3000 });
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify values persisted
    const firstRowAfterReload = page.locator('tbody tr').first();
    await expect(firstRowAfterReload.locator('input[aria-label*="Rumination"]')).toHaveValue('5');
    await expect(firstRowAfterReload.locator('input[aria-label*="Compulsions"]')).toHaveValue('3');
    await expect(firstRowAfterReload.locator('input[aria-label*="Avoidance"]')).toHaveValue('2');
  });

  test('should save and persist Anxiety and Stress scores', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    
    // Fill in Anxiety field
    const anxietyInput = firstRow.locator('input[aria-label*="Anxiety"]');
    await anxietyInput.clear();
    await anxietyInput.fill('8');
    
    // Fill in Stress field
    const stressInput = firstRow.locator('input[aria-label*="Stress"]');
    await stressInput.clear();
    await stressInput.fill('7');
    
    // Wait for autosave
    await page.waitForTimeout(2000);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify values persisted
    const firstRowAfterReload = page.locator('tbody tr').first();
    await expect(firstRowAfterReload.locator('input[aria-label*="Anxiety"]')).toHaveValue('8');
    await expect(firstRowAfterReload.locator('input[aria-label*="Stress"]')).toHaveValue('7');
  });

  test('should enforce min/max constraints on Anxiety field', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    const anxietyInput = firstRow.locator('input[aria-label*="Anxiety"]');
    
    // Try to enter 0 (below minimum of 1)
    await anxietyInput.clear();
    await anxietyInput.fill('0');
    await anxietyInput.blur();
    
    // Wait for correction
    await page.waitForTimeout(500);
    
    // Should be corrected to 1
    await expect(anxietyInput).toHaveValue('1');
    
    // Try to enter 15 (above maximum of 10)
    await anxietyInput.clear();
    await anxietyInput.fill('15');
    await anxietyInput.blur();
    
    // Wait for correction
    await page.waitForTimeout(500);
    
    // Should be capped at 10
    await expect(anxietyInput).toHaveValue('10');
  });

  test('should update Daily Totals when counts change', async ({ page }) => {
    // Get the Daily Totals section (sticky footer)
    const dailyTotals = page.locator('text=/daily totals/i').locator('..');
    
    // Enter values in first row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('input[aria-label*="Rumination"]').fill('5');
    await firstRow.locator('input[aria-label*="Compulsions"]').fill('3');
    await firstRow.locator('input[aria-label*="Avoidance"]').fill('2');
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Verify totals updated (look for the numbers in the totals section)
    await expect(dailyTotals.locator('text=/5/')).toBeVisible();
    await expect(dailyTotals.locator('text=/3/')).toBeVisible();
    await expect(dailyTotals.locator('text=/2/')).toBeVisible();
  });

  test('should save notes field', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    const notesInput = firstRow.locator('input[aria-label*="Notes"]');
    
    // Enter notes
    await notesInput.clear();
    await notesInput.fill('Test notes for timeframe');
    
    // Wait for autosave
    await page.waitForTimeout(2000);
    
    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify notes persisted
    const firstRowAfterReload = page.locator('tbody tr').first();
    await expect(firstRowAfterReload.locator('input[aria-label*="Notes"]'))
      .toHaveValue('Test notes for timeframe');
  });
});
