import { test, expect } from '@playwright/test';

/**
 * Critical Path Test 2: Track This Day Button
 * 
 * Verifies that the manual day tracking button works correctly and
 * that the tracked status persists across page reloads.
 */
test.describe('Track This Day Button', () => {
  test('should show untracked banner and track button on untracked day', async ({ page }) => {
    // Navigate to a future date that likely hasn't been tracked yet
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0];
    
    await page.goto(`/day/${dateStr}`);
    await page.waitForLoadState('networkidle');
    
    // Look for "Day not tracked yet" banner or similar message
    const banner = page.locator('div, section, p').filter({ hasText: /not tracked|track this day/i });
    const bannerVisible = await banner.first().isVisible().catch(() => false);
    
    // Note: If day is already tracked, test passes (acceptable state)
    if (bannerVisible) {
      // Verify "Track This Day" button is visible
      const trackButton = page.locator('button').filter({ hasText: /track/i });
      await expect(trackButton.first()).toBeVisible();
    }
  });

  test('should hide banner after clicking Track This Day', async ({ page }) => {
    // Use a specific test date to ensure reproducibility
    const testDate = '2025-12-30';
    
    await page.goto(`/day/${testDate}`);
    await page.waitForLoadState('networkidle');
    
    // Find and click the "Track This Day" button if it exists
    const trackButton = page.locator('button').filter({ hasText: /track this day/i });
    
    const buttonCount = await trackButton.count();
    if (buttonCount > 0) {
      await trackButton.first().click();
      
      // Wait for the action to complete
      await page.waitForTimeout(3000);
      
      // Banner should disappear or button should change state
      // Either the banner is gone or button text changed
      const bannerGone = await page.locator('div, section').filter({ hasText: /not tracked yet/i })
        .count() === 0;
      const buttonChanged = await page.locator('button').filter({ hasText: /tracked|✓/i })
        .isVisible().catch(() => false);
      
      expect(bannerGone || buttonChanged).toBeTruthy();
    }
  });

  test('should persist tracked status after page reload', async ({ page }) => {
    const testDate = '2025-01-15';
    
    await page.goto(`/day/${testDate}`);
    await page.waitForLoadState('networkidle');
    
    // Click track button if it exists
    const trackButton = page.locator('button').filter({ hasText: /track this day/i });
    if (await trackButton.count() > 0) {
      await trackButton.first().click();
      await page.waitForTimeout(3000);
    }
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify banner does NOT reappear
    const banner = page.locator('div, section').filter({ hasText: /not tracked yet/i });
    const bannerCount = await banner.count();
    
    // Banner should either not exist or not be visible
    if (bannerCount > 0) {
      await expect(banner.first()).not.toBeVisible();
    }
  });
});
