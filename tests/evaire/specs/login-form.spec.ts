import { expect, test } from "../fixtures/fixtures";
import testData from "../data/testData.json";
import userCredentials from "../data/userCredentials.json";

// Test cases: TC-004, TC-006, TC-008, TC-009
const user = userCredentials.Manager;

test.describe("Login form", () => {
  test("TC-004 shows required-field errors on empty submit", async ({
    page,
    pomManager,
  }) => {
    const { loginPage } = pomManager;

    // Count login requests - an empty form should never send one
    let loginRequests = 0;
    page.on("request", (request) => {
      if (request.url().includes("/auth/login")) loginRequests++;
    });

    // Both fields empty
    await loginPage.loginButton.click();
    await expect(loginPage.usernameRequiredError).toBeVisible();
    await expect(loginPage.passwordRequiredError).toBeVisible();

    // Only username filled
    await loginPage.username.fill(testData.unregisteredEmail);
    await loginPage.loginButton.click();
    await expect(loginPage.usernameRequiredError).toBeHidden();
    await expect(loginPage.passwordRequiredError).toBeVisible();

    // Only password filled
    await loginPage.username.clear();
    await loginPage.password.fill(testData.wrongPassword);
    await loginPage.loginButton.click();
    await expect(loginPage.usernameRequiredError).toBeVisible();
    await expect(loginPage.passwordRequiredError).toBeHidden();

    expect(loginRequests).toBe(0);
  });

  test("TC-006 masks the password and the eye icon shows/hides it", async ({
    pomManager,
  }) => {
    const { loginPage } = pomManager;

    await loginPage.password.fill(testData.wrongPassword);
    await expect(loginPage.password).toHaveAttribute("type", "password");

    await loginPage.showPasswordButton.click();
    await expect(loginPage.password).toHaveAttribute("type", "text");

    await loginPage.showPasswordButton.click();
    await expect(loginPage.password).toHaveAttribute("type", "password");
  });

  test("TC-008 login page opens directly with a clean URL", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle("Eclat login");
    await expect(page).toHaveURL("https://login.qa.evaire.ai/login");

    // No error details leaked on the page
    await expect(page.locator("body")).not.toContainText(
      /exception|stack trace|traceback|server error/i,
    );
  });

  test("TC-009 can log in with the keyboard only", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, otpPage, homePage } = pomManager;
    await expect(loginPage.username).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(loginPage.username).toBeFocused();
    await page.keyboard.type(user.Username);

    await page.keyboard.press("Tab");
    await expect(loginPage.password).toBeFocused();
    await page.keyboard.type(user.Password);

    await page.keyboard.press("Tab"); // the eye icon is skipped
    await expect(loginPage.forgotPasswordLink).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(loginPage.loginButton).toBeFocused();

    // Press Enter on the Login button
    await page.keyboard.press("Enter");
    await expect(
      otpPage.heading.or(loginPage.continueAndEndSessionButton),
    ).toBeVisible();
    if (await loginPage.continueAndEndSessionButton.isVisible()) {
      await loginPage.continueAndEndSessionButton.focus();
      await page.keyboard.press("Enter");
    }
    await expect(otpPage.heading).toBeVisible();

    // Type the code and press Enter
    await otpPage.codeBoxes.first().focus();
    await page.keyboard.type(testData.otp);
    await page.keyboard.press("Enter");

    await expect(homePage.welcomeText).toBeVisible();
  });
});
