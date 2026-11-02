import { messages } from "../config/evaireConfig";
import { expect, test } from "../fixtures/evaire.fixtures";

/**
 * Eclat login - Forgot password
 * Forgot Password link and page validation.
 * Source: Eclat_Login_Test_Cases_v3 (TC-007, TC-010)
 */
test.describe("Eclat login - Forgot password", () => {
  test("TC-007 Forgot Password page validation", async ({ app, page }) => {
    await app.login.goto();
    await app.login.expectLoaded();

    await app.login.forgotPasswordLink.click();
    await app.forgot.expectLoaded();

    await app.forgot.sendLinkBtn.click();
    await expect(page.getByText(messages.emailRequired)).toBeVisible();

    await app.forgot.email.fill("plainaddress");
    await app.forgot.sendLinkBtn.click();
    await expect(page.getByText(messages.invalidEmail)).toBeVisible();

    await app.forgot.backLink.click();
    await expect(page).toHaveURL(/\/login$/);
    await app.login.expectLoaded();
  });

  test("TC-010 Forgot Password link navigates and back returns to a usable form", async ({
    app,
    page,
  }) => {
    await app.login.goto();
    await app.login.expectLoaded();

    // Link sits below the password field.
    const pwBox = await app.login.password.boundingBox();
    const linkBox = await app.login.forgotPasswordLink.boundingBox();
    expect(linkBox!.y).toBeGreaterThan(pwBox!.y);

    await app.login.forgotPasswordLink.click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(app.forgot.email).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await app.login.expectLoaded();
    await app.login.username.fill("check");
    await expect(app.login.username).toHaveValue("check");
    await expect(app.login.loginBtn).toBeEnabled();
  });
});
