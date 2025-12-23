import { test, expect } from '@playwright/test';

/**
 * Smoke Test: Basic application functionality
 * 
 * Quick test to verify the application loads and basic features work.
 * Run this first to ensure the test environment is set up correctly.
 */
test.describe('Smoke Test', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded (look for any common element)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Verify no critical errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Give it a moment to catch any errors
    await page.waitForTimeout(1000);
    
    // Check for critical errors (ignore common warnings)
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('DevTools')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should have basic navigation elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should have some navigation links or buttons
    const homeLink = page.locator('a, button').filter({ hasText: /home/i });
    const settingsLink = page.locator('a, button').filter({ hasText: /settings/i });
    
    // At least one of these should exist
    const homeCount = await homeLink.count();
    const settingsCount = await settingsLink.count();
    
    expect(homeCount + settingsCount).toBeGreaterThan(0);
  });
});
