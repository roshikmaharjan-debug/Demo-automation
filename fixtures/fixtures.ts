import { test as base, type Page } from "@playwright/test";
import CartCheckoutPage from "../pages/cart-checkout.page";
import InventoryPage from "../pages/inventory.page";
import LoginPage from "../pages/login.page";
import SideMenuPage from "../pages/side-menu.page";
import { DbManager } from "../tests/db/dbManager";
import { DbConnection } from "../tests/db/dbConnection";
import { ApiManager } from "../tests/api/apiManager";

type AppFixtures = {
  loginPage: LoginPage;
  loggedInPage: Page;
  inventoryPage: InventoryPage;
  cartCheckoutPage: CartCheckoutPage;
  sideMenuPage: SideMenuPage;
  db: DbManager;
  api: ApiManager;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  loggedInPage: async ({ page }, use) => {
    await page.goto("/inventory.html");
    await use(page);
  },

  inventoryPage: async ({ loggedInPage }, use) => {
    await use(new InventoryPage(loggedInPage));
    // this fixture provides an instance of InventoryPage for tests that require it
  }, //and it uses the loggedInPage fixture to ensure the user is logged in before accessing the inventory page

  cartCheckoutPage: async ({ loggedInPage }, use) => {
    await use(new CartCheckoutPage(loggedInPage));
  },

  sideMenuPage: async ({ loggedInPage }, use) => {
    await use(new SideMenuPage(loggedInPage));
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
