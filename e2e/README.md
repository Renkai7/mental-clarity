# End-to-End Testing with Playwright

This directory contains Playwright end-to-end tests that verify critical user workflows in the Mental Clarity application.

## Running Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug
```

## Test Structure

Tests are organized by critical paths from the pre-release checklist:

- `01-day-auto-creation.spec.ts` - Verifies automatic day creation
- `02-track-day-button.spec.ts` - Tests manual day tracking
- `03-entry-field-updates.spec.ts` - Tests timeframe grid field updates
- `04-daily-summary-updates.spec.ts` - Tests daily summary (sleep, exercise, notes)
- `05-navigation.spec.ts` - Tests page navigation and routing

## What's Tested

### ✅ Automated (Playwright)
- Day auto-creation when navigating dates
- Track This Day button functionality and persistence
- Timeframe grid field updates (R/C/A, Anxiety, Stress, Notes)
- Daily summary field updates (Sleep, Exercise, Notes)
- Navigation between pages
- Field validation and constraints
- Data persistence across page reloads
- Autosave indicators

### ⚠️ Manual Testing Required
- Auto-updater functionality (requires real releases)
- Smart evening reminder (time-based)
- Performance benchmarks
- Desktop app-specific features

## Writing New Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator('selector');
    
    // Act
    await element.click();
    
    // Assert
    await expect(page.locator('result')).toBeVisible();
  });
});
```

## CI/CD Integration

These tests can be integrated into your CI/CD pipeline:

```yaml
# .github/workflows/e2e.yml
- name: Run E2E Tests
  run: npm run test:e2e
```

## Debugging Tips

1. **Use UI Mode**: `npm run test:e2e:ui` - Interactive test runner with time-travel debugging
2. **Inspect Elements**: Use browser DevTools while tests run in headed mode
3. **Screenshots**: Failed tests automatically capture screenshots in `test-results/`
4. **Trace Viewer**: Failed tests generate traces you can view with `npx playwright show-trace`

## Configuration

See [`playwright.config.ts`](../playwright.config.ts) for:
- Timeout settings
- Browser configuration
- Screenshot/video settings
- Dev server configuration

## Coverage

Current test coverage: **~60%** of critical paths

### Covered:
- ✅ Day creation and navigation
- ✅ Tracking functionality
- ✅ Data entry and persistence
- ✅ Field validation
- ✅ Navigation flows

### TODO:
- ⬜ Stats page calculations
- ⬜ Settings page configuration
- ⬜ History/Heatmap interactions
- ⬜ Error handling scenarios
