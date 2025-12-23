import { test, expect } from '@playwright/test';

/**
 * Critical Path Test 1: Day Auto-Creation
 * 
 * Verifies that days are automatically created when navigating to any date
 * without requiring manual initialization.
 */
test.describe('Day Auto-Creation', () => {
  test('should automatically create today with timeframe grid', async ({ page }) => {
    await page.goto('/');
    
    // Verify we're on today's date (home page shows current day)
    await expect(page.locator('h1, h2').filter({ hasText: /Timeframes/ })).toBeVisible();
    
    // Verify timeframe grid is visible
    const timeframeGrid = page.locator('table[aria-label*="Timeframe"]');
    await expect(timeframeGrid).toBeVisible();
    
    // Verify at least one timeframe row exists with default values
    const firstRow = timeframeGrid.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    
    // Verify no "Initialize Day" button appears
    await expect(page.locator('button:has-text("Initialize Day")')).not.toBeVisible();
  });

  test('should auto-create previous day when navigating backward', async ({ page }) => {
    await page.goto('/');
    
    // Click previous day button (look for arrow or "Previous" button)
    const prevButton = page.locator('button').filter({ hasText: /previous|<|←/i }).first();
    await prevButton.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify timeframe grid appears
    const timeframeGrid = page.locator('table[aria-label*="Timeframe"]');
    await expect(timeframeGrid).toBeVisible({ timeout: 10000 });
    
    // Verify entries exist with default values
    const firstRow = timeframeGrid.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
  });

  test('should auto-create future day when navigating forward', async ({ page }) => {
    await page.goto('/');
    
    // Click next day button
    const nextButton = page.locator('button').filter({ hasText: /next|>|→/i }).first();
    await nextButton.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify timeframe grid appears
    const timeframeGrid = page.locator('table[aria-label*="Timeframe"]');
    await expect(timeframeGrid).toBeVisible({ timeout: 10000 });
    
    // Verify Daily Summary section is visible
    await expect(page.locator('text=Daily Summary')).toBeVisible();
  });
});
