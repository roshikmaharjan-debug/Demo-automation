import { evaireConfig } from "../config/evaireConfig";
import { EvaireApp, expect, test } from "../fixtures/evaire.fixtures";

/**
 * Eclat login - Session
 * Logout, already-authenticated redirect, one session per account.
 * Source: Eclat_Login_Test_Cases_v3 (TC-012, TC-020, TC-022)
 */
const { username } = evaireConfig.user;

test.describe("Eclat login - Session", () => {
  test("TC-012 logout invalidates the session (back button and reload)", async ({
    app,
    page,
  }) => {
    await app.fullLogin();

    await app.home.logout(username);
    expect(await app.isAuthenticated()).toBe(false);

    await page.goBack();
    await expect(app.login.username).toBeVisible({ timeout: 15_000 });
    await expect(app.home.userMenu(username)).toBeHidden();
    expect(await app.isAuthenticated()).toBe(false);

    await page.reload();
    await expect(app.login.username).toBeVisible({ timeout: 15_000 });
    await expect(app.home.userMenu(username)).toBeHidden();
    expect(await app.isAuthenticated()).toBe(false);
  });

  test("TC-020 already-authenticated user opening /login is redirected home", async ({
    app,
    page,
  }) => {
    await app.fullLogin();

    await app.login.goto();
    await expect(page).toHaveURL(/\/\?clientId=[\w-]+/, { timeout: 15_000 });
    await expect(app.login.username).toBeHidden();
    await app.home.expectLoaded(username);
    expect(await app.isAuthenticated()).toBe(true);
  });

  test("TC-022 active session on another browser is replaced", async ({
    app: firstApp,
    browser,
  }) => {
    test.skip(
      !evaireConfig.runDestructive,
      "Opt-in: set RUN_DESTRUCTIVE=1 in .env to run this case",
    );

    const { password } = evaireConfig.user;

    // Browser 1: logged in
    await firstApp.fullLogin();

    // Browser 2: separate context, same account
    const secondContext = await browser.newContext();
    try {
      const second = new EvaireApp(await secondContext.newPage());
      await second.login.goto();
      await second.login.fill(username, password);
      await second.login.clickLogin();

      await expect(second.login.activeSessionTitle).toBeVisible();
      await expect(second.login.continueEndSessionBtn).toBeVisible();
      await expect(second.otp.heading).toBeHidden();

      await second.login.continueEndSessionBtn.click();
      await second.otp.expectVisible();

      const res = await second.otp.submitCode(evaireConfig.otp.code);
      expect(res.status()).toBe(200);
      await second.home.expectLoaded(username);

      // Browser 1: session ended
      await firstApp.page.reload();
      await expect(firstApp.login.username).toBeVisible({ timeout: 20_000 });
      expect(await firstApp.isAuthenticated()).toBe(false);

      await second.logoutViaApi();
    } finally {
      await secondContext.close();
    }
  });
});
