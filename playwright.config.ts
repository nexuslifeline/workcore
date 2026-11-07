import 'dotenv/config'

import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E configuration
 *
 * Run: `npm run test:e2e` or `npm run test:e2e:ui`
 *
 * --- Environment variables (project root `.env` is loaded via `dotenv/config` above) ---
 *
 * `E2E_BASE_URL` — Origin under test. Relative navigations (`page.goto('/sign-in')`)
 * resolve against this. Defaults to local dev below. Leave unset rather than empty;
 * an empty value in `.env` is treated as missing (same as `playwright.config` / global setup).
 *
 * `E2E_EMAIL` / `E2E_PASSWORD` — When both are set, `e2e/global-setup.ts` signs in once
 * and writes `playwright/.auth/user.json` for the `chromium-authenticated` project.
 * Omit either to skip auth setup (authenticated specs are skipped at runtime).
 *
 * --- Local vs deployed target ---
 *
 * Local (default): `E2E_BASE_URL` unset or `http://127.0.0.1:3000` / `http://localhost:3000`.
 * Playwright starts `webServer` (`npm run dev:e2e`) unless something already responds on
 * that URL (`reuseExistingServer` when not in CI). You can instead run
 * `npm run build && npm run start` yourself and reuse port 3000.
 *
 * Remote (e.g. staging): set `E2E_BASE_URL=https://your-app.example.com`. The local
 * `webServer` block is omitted so Playwright does not also boot Next on localhost.
 *
 * --- Projects ---
 *
 * `chromium` — public routes only (`public-smoke.spec.ts`), no saved session.
 * `chromium-authenticated` — all other specs under `e2e/`, uses storage state from global setup.
 *
 * --- Reporters ---
 *
 * `list` — prints each test as it finishes with ✓ (pass) / ✗ (fail) and ANSI colors in a TTY;
 * ends with an explicit “N passed / M failed” summary (easier to read than `line`).
 * `html` — `playwright-report/`; open with `npx playwright show-report`.
 */
const defaultBaseURL = 'http://127.0.0.1:3000'

/** Effective app origin: env override or local default. */
const resolvedBaseURL = process.env.E2E_BASE_URL?.trim() || defaultBaseURL

/** Only auto-start Next when tests target localhost; skip for remote `E2E_BASE_URL`. */
function shouldStartLocalWebServer(): boolean {
  try {
    const host = new URL(resolvedBaseURL).hostname
    return host === 'localhost' || host === '127.0.0.1'
  } catch {
    return true
  }
}

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: resolvedBaseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testMatch: '**/public-smoke.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-authenticated',
      testIgnore: '**/public-smoke.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
  // Conditionally attach `webServer` so remote staging URLs do not spawn local Next.
  ...(shouldStartLocalWebServer()
    ? {
        webServer: {
          command: 'npm run dev:e2e',
          url: defaultBaseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      }
    : {}),
})
