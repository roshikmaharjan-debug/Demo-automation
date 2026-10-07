import { expect, test } from "@playwright/test";
import LoginPage from "../pages/login.page";
import SideMenuPage from "../pages/side-menu.page";

test.describe("Navigation", () => {
  let sideMenuPage: SideMenuPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    sideMenuPage = new SideMenuPage(page);
    await loginPage.goto();
    await loginPage.login("standard_user", "secret_sauce");
  });

  test("logs out", async ({ page }) => {
    await sideMenuPage.logout();
    await expect(page).toHaveURL("https://www.saucedemo.com/");
  });

  test("opens the About page", async ({ page }) => {
    await sideMenuPage.openAbout();
    await expect(page).toHaveTitle(
      "Sauce Labs: AI-Unified Release Assurance Platform",
    );
  });
  
  test("opens the dynamic catalog spinner", async ({ page }) => {
    await sideMenuPage.openSpinner();
    await expect(page.getByText("Test.allTheThings() T-Shirt (Red)")).toBeVisible();
  });
});
