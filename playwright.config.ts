import { defineConfig, devices } from "@playwright/test";

/**
 * Three independent suites, one Playwright project each:
 *   saucedemo  - UI tests for https://www.saucedemo.com (needs saucedemo-setup)
 *   api        - Restful Booker API tests (no browser; needs .env or CI secrets)
 *   evaire     - Eclat login tests on the evaire QA site
 *                (needs tests/evaire/data/userCredentials.json)
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  // Seeds the local SQLite database used by the SauceDemo login tests.
  globalSetup: "./tests/global-setup.ts",
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    headless: true,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  projects: [
    /* ---------- SauceDemo (tests/saucedemo) ---------- */
    {
      // Logs in once as standard_user and saves playwright/.auth/user.json.
      name: "saucedemo-setup",
      testDir: "./tests/saucedemo",
      testMatch: /auth\.setup\.ts/,
      use: { baseURL: "https://www.saucedemo.com/" },
    },
    {
      name: "saucedemo",
      testDir: "./tests/saucedemo/specs",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://www.saucedemo.com/",
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["saucedemo-setup"],
    },

    /* ---------- Restful Booker API (tests/api) ---------- */
    {
      // API tests need no browser and no logged-in UI session.
      name: "api",
      testDir: "./tests/api",
      testMatch: /.*\.spec\.ts/,
    },

    /* ---------- evaire / Eclat login (tests/evaire) ---------- */
    {
      name: "evaire",
      testDir: "./tests/evaire/specs",
      // One QA account and one active session per account, so run one at a time.
      workers: 1,
      fullyParallel: false,
      timeout: 180_000,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.EVAIRE_BASE_URL ?? "https://login.qa.evaire.ai",
        storageState: { cookies: [], origins: [] },
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
      },
    },
  ],
});
