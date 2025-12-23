import { test, expect } from '@playwright/test';

/**
 * Critical Path Test 4: Daily Summary Updates
 * 
 * Verifies that sleep quality, exercise minutes, and daily notes
 * save correctly and persist across page reloads.
 */
test.describe('Daily Summary Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should save and persist all daily summary fields', async ({ page }) => {
    // Find Daily Summary section
    const dailySummary = page.locator('text=Daily Summary').locator('..');
    await expect(dailySummary).toBeVisible();
    
    // Set Sleep Quality to 9
    const sleepInput = page.locator('input[name="sleepQuality"], input#sleepQuality');
    await sleepInput.clear();
    await sleepInput.fill('9');
    
    // Set Exercise Minutes to 45
    const exerciseInput = page.locator('input[name="exerciseMinutes"], input#exerciseMinutes');
    await exerciseInput.clear();
    await exerciseInput.fill('45');
    
    // Set Daily Notes
    const notesTextarea = page.locator('textarea[name="dailyNotes"], textarea#dailyNotes');
    await notesTextarea.clear();
    await notesTextarea.fill('Feeling great today!');
    
    // Wait for autosave (700ms debounce + network)
    await page.waitForTimeout(2000);
    
    // Verify save indicator appears
    await expect(page.locator('text=/all changes saved/i')).toBeVisible({ timeout: 3000 });
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify all values persisted
    await expect(page.locator('input[name="sleepQuality"], input#sleepQuality'))
      .toHaveValue('9');
    await expect(page.locator('input[name="exerciseMinutes"], input#exerciseMinutes'))
      .toHaveValue('45');
    await expect(page.locator('textarea[name="dailyNotes"], textarea#dailyNotes'))
      .toHaveValue('Feeling great today!');
  });

  test('should use increment/decrement buttons for sleep quality', async ({ page }) => {
    const sleepInput = page.locator('input[name="sleepQuality"], input#sleepQuality');
    
    // Get initial value
    const initialValue = await sleepInput.inputValue();
    const initialNum = parseInt(initialValue) || 7;
    
    // Click increment button
    const incrementButton = page.locator('button[aria-label*="Increase sleep"]');
    await incrementButton.click();
    
    // Wait for update
    await page.waitForTimeout(500);
    
    // Verify value increased
    await expect(sleepInput).toHaveValue((initialNum + 1).toString());
    
    // Click decrement button
    const decrementButton = page.locator('button[aria-label*="Decrease sleep"]');
    await decrementButton.click();
    
    // Wait for update
    await page.waitForTimeout(500);
    
    // Verify value decreased back
    await expect(sleepInput).toHaveValue(initialNum.toString());
  });

  test('should enforce sleep quality min/max constraints', async ({ page }) => {
    const sleepInput = page.locator('input[name="sleepQuality"], input#sleepQuality');
    
    // Try to set below minimum (1)
    await sleepInput.clear();
    await sleepInput.fill('0');
    await sleepInput.blur();
    await page.waitForTimeout(500);
    
    // Should be corrected to 1
    await expect(sleepInput).toHaveValue('1');
    
    // Try to set above maximum (10)
    await sleepInput.clear();
    await sleepInput.fill('15');
    await sleepInput.blur();
    await page.waitForTimeout(500);
    
    // Should be capped at 10
    await expect(sleepInput).toHaveValue('10');
  });

  test('should save exercise minutes with step increment', async ({ page }) => {
    const exerciseInput = page.locator('input[name="exerciseMinutes"], input#exerciseMinutes');
    
    // Set value
    await exerciseInput.clear();
    await exerciseInput.fill('30');
    
    // Wait for autosave
    await page.waitForTimeout(2000);
    
    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify persisted
    await expect(page.locator('input[name="exerciseMinutes"], input#exerciseMinutes'))
      .toHaveValue('30');
  });

  test('should handle empty daily notes', async ({ page }) => {
    const notesTextarea = page.locator('textarea[name="dailyNotes"], textarea#dailyNotes');
    
    // Clear notes
    await notesTextarea.clear();
    await notesTextarea.fill('');
    
    // Wait for autosave
    await page.waitForTimeout(2000);
    
    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify empty state persists
    await expect(page.locator('textarea[name="dailyNotes"], textarea#dailyNotes'))
      .toHaveValue('');
  });
});
