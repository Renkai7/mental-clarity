import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration
 * 
 * Tests run against a local dev server (npm run dev)
 * For production testing, change baseURL to production URL
 */
export default defineConfig({
  testDir: './e2e',
  
  // Maximum time one test can run
  timeout: 30 * 1000,
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html'],
    ['list'],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:3000',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Capture video on failure
    video: 'retain-on-failure',
    
    // Collect trace on failure
    trace: 'on-first-retry',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
