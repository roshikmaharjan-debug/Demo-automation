import { evaireConfig, messages } from "../config/evaireConfig";
import { expect, test } from "../fixtures/evaire.fixtures";

/**
 * Eclat login - Login form
 * Field validation, password masking, direct access and keyboard use.
 * Source: Eclat_Login_Test_Cases_v3 (TC-004, TC-006, TC-008, TC-009)
 */
const { username, password } = evaireConfig.user;
const OTP = evaireConfig.otp.code; // QA uses a fixed OTP (000000)

test.describe("Eclat login - Login form", () => {
  test("TC-004 required-field validation on empty submit", async ({
    app,
    page,
  }) => {
    await app.login.goto();
    await app.login.expectLoaded();

    const loginRequests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/auth/login") && r.method() === "POST")
        loginRequests.push(r.url());
    });

    // Required markers
    await expect(app.login.usernameLabel).toContainText("*");
    await expect(app.login.passwordLabel).toContainText("*");

    // Both empty
    await app.login.loginBtn.click();
    await expect(app.login.usernameError).toBeVisible();
    await expect(app.login.passwordError).toBeVisible();
    await expect(app.login.username).toHaveAttribute("aria-invalid", "true");
    await expect(app.login.password).toHaveAttribute("data-invalid", "true");

    // Only username filled
    await app.login.username.fill("someuser");
    await app.login.loginBtn.click();
    await expect(app.login.usernameError).toBeHidden();
    await expect(app.login.passwordError).toBeVisible();

    // Only password filled
    await app.login.username.clear();
    await app.login.password.fill("SomePass!1");
    await app.login.loginBtn.click();
    await expect(app.login.usernameError).toBeVisible();
    await expect(app.login.passwordError).toBeHidden();

    // No /auth/login request was sent for any empty submit
    await page.waitForTimeout(500);
    expect(loginRequests).toHaveLength(0);
  });

  test("TC-006 password masking and show/hide toggle", async ({
    app,
    page,
    browserName,
  }) => {
    await app.login.goto();
    await app.login.expectLoaded();

    const secret = "MySecret!42";
    await app.login.password.fill(secret);
    await expect(app.login.password).toHaveAttribute("type", "password");

    await app.login.passwordToggle.click();
    await expect(app.login.password).toHaveAttribute("type", "text");
    await expect(app.login.password).toHaveValue(secret);

    await app.login.passwordToggle.click();
    await expect(app.login.password).toHaveAttribute("type", "password");

    // Masked value can't be copied as plain text (clipboard check is Chromium-only).
    if (browserName !== "chromium") return;
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"])
      .catch(() => undefined);
    await page.evaluate(() =>
      navigator.clipboard.writeText("").catch(() => {}),
    );
    await app.login.password.focus();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("ControlOrMeta+c");
    await app.login.username.fill("");
    await app.login.username.focus();
    await page.keyboard.press("ControlOrMeta+v");
    await expect(app.login.username).not.toHaveValue(secret);
  });

  test("TC-008 direct access to the login page", async ({ app, page }) => {
    await app.login.goto();
    await app.login.expectLoaded();

    await page.goto(`${evaireConfig.baseUrl}/login`);
    await app.login.expectLoaded();
    expect(new URL(page.url()).pathname).toBe("/login");
    expect(new URL(page.url()).search).toBe("");
    await expect(page).toHaveTitle(messages.pageTitle);

    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(
      /stack ?trace|exception|traceback|nginx\/|apache\/|internal server error|localhost|127\.0\.0\.1/i,
    );
  });

  test("TC-009 keyboard-only login and tab order", async ({ app, page }) => {
    await app.login.goto();
    await app.login.expectLoaded();

    await page.keyboard.press("Tab");
    await expect(app.login.username).toBeFocused();
    await page.keyboard.type(username);

    await page.keyboard.press("Tab");
    await expect(app.login.password).toBeFocused();
    await page.keyboard.type(password);

    await page.keyboard.press("Tab"); // eye icon (tabindex=-1) is skipped
    await expect(app.login.forgotPasswordLink).toBeFocused();
    await expect(app.login.passwordToggle).toHaveAttribute("tabindex", "-1");

    await page.keyboard.press("Tab");
    await expect(app.login.loginBtn).toBeFocused();

    // Back to Password and submit with Enter
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(app.login.password).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(
      app.otp.heading.or(app.login.continueEndSessionBtn),
    ).toBeVisible({ timeout: 15_000 });
    if (await app.login.continueEndSessionBtn.isVisible()) {
      await app.login.continueEndSessionBtn.focus();
      await page.keyboard.press("Enter");
    }
    await app.otp.expectVisible();

    // Move focus into the first code box using the keyboard only
    for (let i = 0; i < 5; i++) {
      if (
        await app.otp.pins
          .first()
          .evaluate((el) => el === document.activeElement)
      )
        break;
      await page.keyboard.press("Tab");
    }
    await expect(app.otp.pins.first()).toBeFocused();

    await page.keyboard.type(OTP);
    await page.keyboard.press("Enter");

    await app.home.expectLoaded(username);
  });
});
