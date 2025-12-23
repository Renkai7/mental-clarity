import { test, expect } from '@playwright/test';

/**
 * Critical Path Test 3: Entry Field Updates
 * 
 * Verifies that all numeric fields in the timeframe grid save correctly
 * and persist across page reloads.
 */
test.describe('Entry Field Updates', () => {
  const testDate = '2024-12-20';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`/day/${testDate}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for data to load
  });

  test('should save and persist Rumination, Compulsions, Avoidance counts', async ({ page }) => {
    // Find the timeframe table
    const table = page.locator('table[aria-label*="Timeframe"]');
    await expect(table).toBeVisible({ timeout: 10000 });
    
    // Find first data row
    const firstRow = table.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    
    // Find input fields by looking within table cells
    // The table has columns: Block, Rumination, Compulsions, Avoidance, Anxiety, Stress, Notes
    const cells = firstRow.locator('td');
    
    // Rumination is in column index 1 (0-based)
    const ruminationInput = cells.nth(1).locator('input');
    await ruminationInput.clear();
    await ruminationInput.fill('5');
    
    // Compulsions is in column index 2
    const compulsionsInput = cells.nth(2).locator('input');
    await compulsionsInput.clear();
    await compulsionsInput.fill('3');
    
    // Avoidance is in column index 3
    const avoidanceInput = cells.nth(3).locator('input');
    await avoidanceInput.clear();
    await avoidanceInput.fill('2');
    
    // Wait for autosave with extra buffer (700ms debounce + save + extra margin)
    await page.waitForTimeout(5000);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify values persisted
    const tableAfterReload = page.locator('table[aria-label*="Timeframe"]');
    const firstRowAfterReload = tableAfterReload.locator('tbody tr').first();
    const cellsAfterReload = firstRowAfterReload.locator('td');
    
    await expect(cellsAfterReload.nth(1).locator('input')).toHaveValue('5');
    await expect(cellsAfterReload.nth(2).locator('input')).toHaveValue('3');
    await expect(cellsAfterReload.nth(3).locator('input')).toHaveValue('2');
  });

  test('should save and persist Anxiety and Stress scores', async ({ page }) => {
    const table = page.locator('table[aria-label*="Timeframe"]');
    await expect(table).toBeVisible({ timeout: 10000 });
    
    const firstRow = table.locator('tbody tr').first();
    const cells = firstRow.locator('td');
    
    // Anxiety is in column index 4
    const anxietyInput = cells.nth(4).locator('input');
    await anxietyInput.clear();
    await anxietyInput.fill('8');
    
    // Stress is in column index 5
    const stressInput = cells.nth(5).locator('input');
    await stressInput.clear();
    await stressInput.fill('7');
    
    // Wait for autosave with extra buffer
    await page.waitForTimeout(5000);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify values persisted
    const tableAfterReload = page.locator('table[aria-label*="Timeframe"]');
    const firstRowAfterReload = tableAfterReload.locator('tbody tr').first();
    const cellsAfterReload = firstRowAfterReload.locator('td');
    
    await expect(cellsAfterReload.nth(4).locator('input')).toHaveValue('8');
    await expect(cellsAfterReload.nth(5).locator('input')).toHaveValue('7');
  });

  test('should enforce min/max constraints on Anxiety field', async ({ page }) => {
    const table = page.locator('table[aria-label*="Timeframe"]');
    await expect(table).toBeVisible({ timeout: 10000 });
    
    const firstRow = table.locator('tbody tr').first();
    const cells = firstRow.locator('td');
    const anxietyInput = cells.nth(4).locator('input');
    
    // Try to enter 0 (below minimum of 1)
    await anxietyInput.clear();
    await anxietyInput.fill('0');
    await anxietyInput.blur();
    await page.waitForTimeout(1000);
    
    // Should be corrected to 1
    const value1 = await anxietyInput.inputValue();
    expect(parseInt(value1)).toBeGreaterThanOrEqual(1);
    
    // Try to enter 15 (above maximum of 10)
    await anxietyInput.clear();
    await anxietyInput.fill('15');
    await anxietyInput.blur();
    await page.waitForTimeout(1000);
    
    // Should be capped at 10
    const value2 = await anxietyInput.inputValue();
    expect(parseInt(value2)).toBeLessThanOrEqual(10);
  });
});
