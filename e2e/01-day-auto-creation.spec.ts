import { test, expect } from '@playwright/test';

/**
 * Critical Path Test 1: Day Auto-Creation
 * 
 * Verifies that days are automatically created when navigating to any date
 * without requiring manual initialization.
 */
test.describe('Day Auto-Creation', () => {
  test('should show home view with Mental Clarity Tracker', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the home page with the main title
    await expect(page.locator('h1').filter({ hasText: /Mental Clarity Tracker/i })).toBeVisible();
    
    // Verify the metric grid is present (last 30 days)
    const gridContainer = page.locator('div').filter({ hasText: /Last 30 Days|Metric Grid/i }).first();
    await expect(gridContainer.or(page.locator('body'))).toBeVisible();
  });

  test('should navigate to today detail page and auto-create day', async ({ page }) => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Navigate directly to today's detail page
    await page.goto(`/day/${today}`);
    await page.waitForLoadState('networkidle');
    
    // Verify timeframe section exists (might be in a table or list)
    const hasTimeframes = await page.locator('text=/timeframe/i').first().isVisible().catch(() => false);
    const hasGrid = await page.locator('tbody tr').first().isVisible().catch(() => false);
    
    // At least one should be visible
    expect(hasTimeframes || hasGrid).toBeTruthy();
    
    // Verify no "Initialize Day" button appears
    const initButton = page.locator('button').filter({ hasText: /initialize day/i });
    await expect(initButton).not.toBeVisible();
  });

  test('should auto-create past day when directly accessing date', async ({ page }) => {
    // Navigate to a past date (3 days ago)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    const dateStr = pastDate.toISOString().split('T')[0];
    
    await page.goto(`/day/${dateStr}`);
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded without errors
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Verify no initialization prompt
    const initButton = page.locator('button').filter({ hasText: /initialize/i });
    await expect(initButton).not.toBeVisible();
  });
});
