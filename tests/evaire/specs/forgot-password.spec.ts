import { expect, test } from "../fixtures/fixtures";
import userCredentials from "../data/userCredentials.json";

// Test cases: TC-007, TC-010, TC-023
const user = userCredentials.Coder;

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

    // Back link returns to login
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

    // The browser's Back button, not the page's Back link (TC-007 covers that).
    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.username).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  // Sends a real reset email to the Coder account every run.
  test("TC-023 sending a reset link shows the confirmation and Return to Login goes back", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, forgotPasswordPage } = pomManager;

    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/\/forgot-password$/);

    await forgotPasswordPage.sendLink(user.Email);
    await expect(forgotPasswordPage.checkEmailHeading).toBeVisible();

    await forgotPasswordPage.returnToLoginLink.click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
