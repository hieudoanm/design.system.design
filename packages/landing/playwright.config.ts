import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT ?? 3000);
const basePath = '/design.system.design';

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/report.json' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${port}${basePath}`,
    viewport: { width: 1280, height: 720 },
    // Record every run. The videos are WebM; `pnpm e2e:video` turns them into
    // the MP4s in `videos/`.
    video: { mode: 'on', size: { width: 1280, height: 720 } },
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // The site is a static export, so the tests run against the exported site
  // in `out/`, served with the same base path as production.
  webServer: {
    command: `pnpm exec next build && PORT=${port} node scripts/ts/serve.mts ${port}`,
    url: `http://localhost:${port}${basePath}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
