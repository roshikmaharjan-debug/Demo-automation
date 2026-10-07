import { expect, test } from "../fixtures/fixtures.ts";
test.describe("Navigation", () => {

  test("logs out", async ({ page,sideMenuPage }) => {
    await sideMenuPage.logout();
    await expect(page).toHaveURL(/saucedemo\.com/);
  });

  test("opens the About page", async ({ page,sideMenuPage }) => {
    await sideMenuPage.openAbout();
    await expect(page).toHaveURL(/saucelabs\.com/);
  });

  test("opens the dynamic catalog spinner", async ({ page,sideMenuPage }) => {
    await sideMenuPage.openSpinner();
    await expect(
      page.locator('[data-test*="spinner-container"]'),
    ).toBeVisible();
  });
});
