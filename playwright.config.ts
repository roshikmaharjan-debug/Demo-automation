import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/global-setup.ts",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    headless: true,
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "https://www.saucedemo.com/",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    /* ---------- SauceDemo (tests/saucedemo) ---------- */
    {
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
        baseURL: process.env.EVAIRE_BASE_URL || "https://login.qa.evaire.ai",
        storageState: { cookies: [], origins: [] },
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
