import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration des tests E2E (bout-en-bout) Playwright.
 * - testDir : dossier des tests E2E
 * - webServer : Playwright démarre lui-même le frontend Vite avant les tests
 *   (et réutilise le serveur déjà lancé s'il y en a un).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
