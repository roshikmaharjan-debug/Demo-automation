import { test as base, type Page } from "@playwright/test";
import CartCheckoutPage from "../pages/cart-checkout.page";
import InventoryPage from "../pages/inventory.page";
import LoginPage from "../pages/login.page";
import SideMenuPage from "../pages/side-menu.page";

type AppFixtures = {
  loginPage: LoginPage;
  loggedInPage: Page;
  inventoryPage: InventoryPage;
  cartCheckoutPage: CartCheckoutPage;
  sideMenuPage: SideMenuPage;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  loggedInPage: async ({ page }, use) => {
    // this fixture logs in the user and provides a logged-in page for tests
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("standard_user", "secret_sauce");
    await use(page); //Put page instead of loginPage to provide the logged-in page for tests
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
});

export { expect } from "@playwright/test";
