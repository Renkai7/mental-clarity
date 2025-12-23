import { test, expect } from '@playwright/test';

/**
 * Critical Path Test 2: Track This Day Button
 * 
 * Verifies that the manual day tracking button works correctly and
 * that the tracked status persists across page reloads.
 */
test.describe('Track This Day Button', () => {
  test('should show untracked banner and track button on new day', async ({ page }) => {
    await page.goto('/');
    
    // Look for "Day not tracked yet" banner
    const banner = page.locator('div, section').filter({ hasText: /not tracked yet/i });
    await expect(banner).toBeVisible({ timeout: 10000 });
    
    // Verify "Track This Day" button is visible
    const trackButton = page.locator('button').filter({ hasText: /track this day/i });
    await expect(trackButton).toBeVisible();
  });

  test('should hide banner after clicking Track This Day', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click the "Track This Day" button
    const trackButton = page.locator('button').filter({ hasText: /track this day/i });
    
    // Only proceed if the button exists (day might already be tracked)
    if (await trackButton.count() > 0) {
      await trackButton.click();
      
      // Wait for the banner to disappear
      await expect(page.locator('div, section').filter({ hasText: /not tracked yet/i }))
        .not.toBeVisible({ timeout: 5000 });
      
      // Verify no error messages appear
      await expect(page.locator('role=alert').filter({ hasText: /error|fail/i }))
        .not.toBeVisible();
    }
  });

  test('should persist tracked status after page reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click track button if it exists
    const trackButton = page.locator('button').filter({ hasText: /track this day/i });
    if (await trackButton.count() > 0) {
      await trackButton.click();
      await page.waitForTimeout(2000); // Wait for save
    }
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify banner does NOT reappear
    const banner = page.locator('div, section').filter({ hasText: /not tracked yet/i });
    await expect(banner).not.toBeVisible({ timeout: 5000 });
  });

  test('should persist tracked status after navigation away and back', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Track the day if not already tracked
    const trackButton = page.locator('button').filter({ hasText: /track this day/i });
    if (await trackButton.count() > 0) {
      await trackButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Navigate to settings
    await page.locator('a, button').filter({ hasText: /settings/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Navigate back to home
    await page.locator('a, button').filter({ hasText: /home/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Verify banner still does not appear
    const banner = page.locator('div, section').filter({ hasText: /not tracked yet/i });
    await expect(banner).not.toBeVisible({ timeout: 5000 });
  });
});
