import { expect, test } from "../fixtures/fixtures";

// Test cases: TC-007, TC-010

test.describe("Forgot password", () => {
  test("TC-007 validates the email field", async ({ page, pomManager }) => {
    const { loginPage, forgotPasswordPage } = pomManager;

    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(forgotPasswordPage.heading).toBeVisible();

    // Empty email
    await forgotPasswordPage.sendLinkButton.click();
    await expect(page.getByText("Email is required")).toBeVisible();

    // Invalid email
    await forgotPasswordPage.sendLink("plainaddress");
    await expect(page.getByText("Invalid email address")).toBeVisible();

    // Back to login
    await forgotPasswordPage.backButton.click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("TC-010 Forgot Password link opens the page and browser Back returns to login", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, forgotPasswordPage } = pomManager;

    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(forgotPasswordPage.email).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.username).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });
});
