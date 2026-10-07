import { expect, test } from "../fixtures/fixtures.ts";


test.describe("Login", () => {


  test.beforeEach(async ({ page,loginPage }) => {
    await loginPage.goto();
  });

  test("logs in successfully", async ({ page,loginPage }) => {
    await loginPage.login("standard_user", "secret_sauce");
    await expect(page).toHaveURL("/inventory.html");
  });

  test("shows an error for an incorrect password", async ({ page,loginPage }) => {
    await loginPage.login("standard_user", "asd");
    await expect(page.getByText(/do not match/i)).toBeVisible();
  });

  test("shows an error for a locked-out user", async ({ page,loginPage }) => {
    await loginPage.login("locked_out_user", "secret_sauce");
    await expect(page.getByText(/locked out/i)).toBeVisible();
  });
});
