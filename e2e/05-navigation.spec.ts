import { test, expect } from '@playwright/test';

/**
 * Regression Test: Navigation
 * 
 * Verifies that core navigation functionality works correctly:
 * - Date navigation (previous/next)
 * - Tab navigation (Home/History/Stats/Settings)
 * - Logo click returns to home
 */
test.describe('Navigation', () => {
  test('should navigate between pages using tab links', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to History
    await page.locator('a, button').filter({ hasText: /history/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/history/);
    
    // Navigate to Stats
    await page.locator('a, button').filter({ hasText: /stats/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/stats/);
    
    // Navigate to Settings
    await page.locator('a, button').filter({ hasText: /settings/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/settings/);
    
    // Navigate back to Home
    await page.locator('a, button').filter({ hasText: /^home$/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/$|\/day/);
  });

  test('should navigate to previous and next days', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get current URL
    const currentUrl = page.url();
    
    // Click Next Day
    const nextButton = page.locator('button').filter({ hasText: /next|>|→/i }).first();
    await nextButton.click();
    await page.waitForLoadState('networkidle');
    
    // Verify URL changed
    const nextUrl = page.url();
    expect(nextUrl).not.toBe(currentUrl);
    
    // Click Previous Day
    const prevButton = page.locator('button').filter({ hasText: /previous|<|←/i }).first();
    await prevButton.click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're back to original URL
    expect(page.url()).toBe(currentUrl);
  });

  test('should return to home when clicking logo', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Settings
    await page.locator('a, button').filter({ hasText: /settings/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Click logo (usually an h1, link, or button at the top)
    const logo = page.locator('h1, a[href="/"], button').filter({ hasText: /mental clarity/i }).first();
    if (await logo.count() > 0) {
      await logo.click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're back home
      await expect(page).toHaveURL(/\/$|\/day/);
    }
  });

  test('should handle direct navigation to specific date', async ({ page }) => {
    // Navigate to a specific date
    const testDate = '2024-01-15';
    await page.goto(`/day/${testDate}`);
    await page.waitForLoadState('networkidle');
    
    // Verify timeframe grid loads
    await expect(page.locator('table[aria-label*="Timeframe"]'))
      .toBeVisible({ timeout: 10000 });
    
    // Verify Daily Summary is visible
    await expect(page.locator('text=Daily Summary')).toBeVisible();
  });

  test('should maintain navigation state during page reloads', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Stats
    await page.locator('a, button').filter({ hasText: /stats/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify still on Stats page
    await expect(page).toHaveURL(/stats/);
  });
});
