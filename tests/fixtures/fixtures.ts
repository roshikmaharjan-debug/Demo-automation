import { test as base, type Page } from "@playwright/test";
import { ApiManager } from "../api/apiManager";
import { DbConnection } from "../db/dbConnection";
import { DbManager } from "../db/dbManager";
import { POMManager } from "../pages/POMManager";

type AppFixtures = {
  pomManager: POMManager;
  loggedInPage: Page;
  db: DbManager;
  api: ApiManager;
};

export const test = base.extend<AppFixtures>({
  loggedInPage: async ({ page }, use) => {  //no POM call because sessionStorage logs in
    await page.goto("/inventory.html");
    await use(page);
  },

  pomManager: async ({ loggedInPage }, use) => {
    await use(new POMManager(loggedInPage));
  },

  db: async ({}, use) => {
    const dbManager = new DbManager();
    try {
      await use(dbManager);
    } finally {
      DbConnection.close();
    }
  },

  api: async ({}, use) => {
    const apiManager = await ApiManager.create();
    try {
      await use(apiManager);
    } finally {
      try {
        await apiManager.cleanup();
      } finally {
        await apiManager.dispose();
      }
    }
  },
});

export { expect } from "@playwright/test";
