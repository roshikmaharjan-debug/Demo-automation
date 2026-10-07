import { expect, test } from "@playwright/test";
import LoginPage from "../pages/login.page";

test.describe("Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("logs in successfully", async ({ page }) => {
    await loginPage.login("standard_user", "secret_sauce");
    await expect(page).toHaveURL("/inventory.html");
  });

  test("shows an error for an incorrect password", async ({ page }) => {
    await loginPage.login("standard_user", "asd");
    await expect(
      page.getByText(/do not match/i),
    ).toBeVisible();
  });

  test("shows an error for a locked-out user", async ({ page }) => {
    await loginPage.login("locked_out_user", "secret_sauce");
    await expect(page.getByText(/locked out/i)).toBeVisible();
  });
});
