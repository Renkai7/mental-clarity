import { test, expect } from '@playwright/test';

/**
 * Critical Path Test 4: Daily Summary Updates
 * 
 * Verifies that sleep quality, exercise minutes, and daily notes
 * save correctly and persist across page reloads.
 */
test.describe('Daily Summary Updates', () => {
  const testDate = '2024-12-22';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`/day/${testDate}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for data to load
  });

  test('should save and persist all daily summary fields', async ({ page }) => {
    // Find Daily Summary section inputs by their IDs
    const sleepInput = page.locator('input#sleepQuality');
    const exerciseInput = page.locator('input#exerciseMinutes');
    const notesTextarea = page.locator('textarea#dailyNotes');
    
    // Wait for elements to be visible
    await expect(sleepInput).toBeVisible({ timeout: 10000 });
    await expect(exerciseInput).toBeVisible({ timeout: 10000 });
    await expect(notesTextarea).toBeVisible({ timeout: 10000 });
    
    // Set Sleep Quality to 9
    await sleepInput.clear();
    await sleepInput.fill('9');
    
    // Set Exercise Minutes to 45
    await exerciseInput.clear();
    await exerciseInput.fill('45');
    
    // Set Daily Notes
    await notesTextarea.clear();
    await notesTextarea.fill('Feeling great today!');
    
    // Wait for autosave with extra buffer (700ms debounce + save + extra margin)
    await page.waitForTimeout(5000);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify all values persisted
    await expect(page.locator('input#sleepQuality')).toHaveValue('9');
    await expect(page.locator('input#exerciseMinutes')).toHaveValue('45');
    await expect(page.locator('textarea#dailyNotes')).toHaveValue('Feeling great today!');
  });

  test('should use increment/decrement buttons for sleep quality', async ({ page }) => {
    const sleepInput = page.locator('input#sleepQuality');
    await expect(sleepInput).toBeVisible({ timeout: 10000 });
    
    // Get initial value
    const initialValue = await sleepInput.inputValue();
    const initialNum = parseInt(initialValue) || 7;
    
    // Find the increment button (+ button)
    const incrementButton = page.locator('button[aria-label*="Increase sleep"]');
    await incrementButton.click();
    await page.waitForTimeout(500);
    
    // Verify value increased
    const afterInc = await sleepInput.inputValue();
    expect(parseInt(afterInc)).toBe(Math.min(initialNum + 1, 10));
    
    // Find the decrement button (- button)
    const decrementButton = page.locator('button[aria-label*="Decrease sleep"]');
    await decrementButton.click();
    await page.waitForTimeout(500);
    
    // Verify value decreased back
    const afterDec = await sleepInput.inputValue();
    expect(parseInt(afterDec)).toBeLessThanOrEqual(parseInt(afterInc));
  });

  test('should enforce sleep quality min/max constraints', async ({ page }) => {
    const sleepInput = page.locator('input#sleepQuality');
    await expect(sleepInput).toBeVisible({ timeout: 10000 });
    
    // Try to set below minimum (1)
    await sleepInput.clear();
    await sleepInput.fill('0');
    await sleepInput.blur();
    await page.waitForTimeout(1000);
    
    // Should be corrected to at least 1
    const value1 = await sleepInput.inputValue();
    expect(parseInt(value1)).toBeGreaterThanOrEqual(1);
    
    // Try to set above maximum (10)
    await sleepInput.clear();
    await sleepInput.fill('15');
    await sleepInput.blur();
    await page.waitForTimeout(1000);
    
    // Should be capped at 10
    const value2 = await sleepInput.inputValue();
    expect(parseInt(value2)).toBeLessThanOrEqual(10);
  });

  test('should save exercise minutes', async ({ page }) => {
    const exerciseInput = page.locator('input#exerciseMinutes');
    await expect(exerciseInput).toBeVisible({ timeout: 10000 });
    
    // Set value
    await exerciseInput.clear();
    await exerciseInput.fill('30');
    
    // Wait for autosave with extra buffer
    await page.waitForTimeout(5000);
    
    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify persisted
    await expect(page.locator('input#exerciseMinutes')).toHaveValue('30');
  });

  test('should handle empty daily notes', async ({ page }) => {
    const notesTextarea = page.locator('textarea#dailyNotes');
    await expect(notesTextarea).toBeVisible({ timeout: 10000 });
    
    // Clear notes
    await notesTextarea.clear();
    
    // Wait for autosave with extra buffer
    await page.waitForTimeout(5000);
    
    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify empty state persists
    await expect(page.locator('textarea#dailyNotes')).toHaveValue('');
  });
});
