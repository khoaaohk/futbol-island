import { defineConfig, devices } from '@playwright/test';

/**
 * Device suite (docs/testing-devices.md). Runs against the dev server on :8092: an already-running server is reused
 * (never restarted); otherwise `npm run dev` is started. Set FI_URL to point at another build.
 *
 *   npm run test:devices          all projects
 *   npm run test:devices:ios      WebKit phones/tablets only
 *
 * Screenshots are captured as test artifacts on every run. Pixel comparison is opt-in (FI_VISUAL=1) and there are no
 * committed baselines yet: set them with `FI_VISUAL=1 npx playwright test --update-snapshots` once the bean characters land.
 */
const baseURL = process.env.FI_URL || 'http://localhost:8092';

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results/devices',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
  // The island boots a full three.js world on a dev server; first compiles are slow.
  timeout: 240_000,
  expect: { timeout: 20_000, toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' } },
  fullyParallel: false,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'test-results/devices-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    navigationTimeout: 180_000,
    actionTimeout: 30_000,
  },
  webServer: process.env.FI_URL ? undefined : {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 240_000,
  },
  projects: [
    { name: 'iphone-se', use: { ...devices['iPhone SE (3rd gen)'] } },
    { name: 'iphone-15', use: { ...devices['iPhone 15'] } },
    { name: 'ipad-gen7', use: { ...devices['iPad (gen 7)'] } },
    { name: 'ipad-pro-11', use: { ...devices['iPad Pro 11'] } },
    { name: 'pixel-7', use: { ...devices['Pixel 7'] } },
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
});
