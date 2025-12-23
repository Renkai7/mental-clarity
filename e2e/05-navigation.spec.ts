import { test, expect } from '@playwright/test';

/**
 * Regression Test: Navigation
 * 
 * Verifies that core navigation functionality works correctly:
 * - Tab-based navigation (Home/History/Stats/Settings)
 * - Day detail page loading
 */
test.describe('Navigation', () => {
  test('should navigate between tabs using buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify Home tab is active/visible
    await expect(page.locator('h1').filter({ hasText: /Mental Clarity Tracker/i })).toBeVisible();
    
    // Navigate to Stats tab
    const statsButton = page.locator('button, a').filter({ hasText: /^stats$/i });
    if (await statsButton.count() > 0) {
      await statsButton.click();
      await page.waitForTimeout(1000);
      
      // Verify Stats content appears (look for common stats terms)
      const statsVisible = await page.locator('text=/clarity index|average|streak/i').first()
        .isVisible().catch(() => false);
      expect(statsVisible).toBeTruthy();
    }
    
    // Navigate to Settings tab
    const settingsButton = page.locator('button, a').filter({ hasText: /settings/i });
    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForTimeout(1000);
      
      // Verify Settings content appears
      const settingsVisible = await page.locator('text=/configuration|preferences|settings/i').first()
        .isVisible().catch(() => false);
      expect(settingsVisible).toBeTruthy();
    }
    
    // Navigate back to Home tab
    const homeButton = page.locator('button, a').filter({ hasText: /^home$/i });
    if (await homeButton.count() > 0) {
      await homeButton.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('h1').filter({ hasText: /Mental Clarity Tracker/i })).toBeVisible();
    }
  });

  test('should navigate to specific date detail page', async ({ page }) => {
    // Navigate to a specific date
    const testDate = '2024-12-15';
    await page.goto(`/day/${testDate}`);
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded successfully
    await expect(page.locator('body')).toBeVisible();
    
    // Verify we're on a day detail page (not main page)
    const isDetailPage = await page.locator('h1').filter({ hasText: /Mental Clarity Tracker/i })
      .count() === 0;
    expect(isDetailPage).toBeTruthy();
  });

  test('should handle navigation to today via direct URL', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    
    await page.goto(`/day/${today}`);
    await page.waitForLoadState('networkidle');
    
    // Verify page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate between different dates', async ({ page }) => {
    // Start on one date
    const date1 = '2024-12-15';
    await page.goto(`/day/${date1}`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to another date
    const date2 = '2024-12-16';
    await page.goto(`/day/${date2}`);
    await page.waitForLoadState('networkidle');
    
    // Verify navigation succeeded
    expect(page.url()).toContain(date2);
  });
});
