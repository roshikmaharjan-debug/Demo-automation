import { expect, test } from "../fixtures/fixtures";
import userCredentials from "../data/userCredentials.json";
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

    await forgotPasswordPage.backButton.click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.username).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("TC-023 Forgot Password link opens the page and browser Forward returns to forgot password", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, forgotPasswordPage } = pomManager;

    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(forgotPasswordPage.email).toBeVisible();

    await forgotPasswordPage.email.fill(userCredentials.Manager.Email);
    await forgotPasswordPage.sendLinkButton.click();
    await expect(forgotPasswordPage.heading2).toBeVisible();
    await forgotPasswordPage.return.click();
      await expect(page).toHaveURL(/\/login$/);
  });
});
