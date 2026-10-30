import { expect, test } from "./fixtures/fixtures";
test.describe("Navigation", () => {
  test("logs out", async ({ page, pomManager }) => {
    await pomManager.sideMenuPage.logout();
    await expect(page.getByPlaceholder("Username")).toBeVisible();
  });

  test("opens the About page", async ({ page, pomManager }) => {
    await pomManager.sideMenuPage.openAbout();
    await expect(page).toHaveURL(/saucelabs\.com/);
  });

  test("opens the dynamic catalog spinner", async ({ page, pomManager }) => {
    await pomManager.sideMenuPage.openSpinner();
    await expect(
      page.locator('[data-test*="spinner-container"]'),
    ).toBeVisible();
  });
});
