import { evaireConfig, messages, testData } from "../config/evaireConfig";
import { expect, test } from "../fixtures/evaire.fixtures";

/**
 * Eclat login - Lockout
 * Failed-attempt lockout (opt-in, needs the documented policy).
 * Source: Eclat_Login_Test_Cases_v3 (TC-013)
 */
test.describe("Eclat login - Lockout", () => {
  test("TC-013 failed-attempt lockout or rate limit", async ({ app, page }) => {
    test.skip(
      !evaireConfig.runDestructive,
      "Opt-in: set RUN_DESTRUCTIVE=1 in .env to run this case",
    );

    const { username, password, threshold, durationSec, messagePattern } =
      evaireConfig.lockout;
    test.skip(
      !username || !password || threshold <= 0 || durationSec <= 0,
      "Needs LOCKOUT_USERNAME, LOCKOUT_PASSWORD, LOCKOUT_THRESHOLD and LOCKOUT_DURATION_SEC (documented policy)",
    );
    test.setTimeout((durationSec + 180) * 1000);
    const lockoutText = new RegExp(messagePattern, "i");

    await app.login.goto();
    await app.login.username.fill(username);

    for (let i = 1; i <= threshold; i++) {
      await test.step(`wrong attempt ${i}/${threshold}`, async () => {
        // Change one character each time - the button stays disabled otherwise.
        await app.login.password.fill(`${testData.wrongPassword}${i}`);
        await app.login.clickLogin();
        await expect(
          page.getByText(messages.loginFailed).or(page.getByText(lockoutText)),
        ).toBeVisible();
      });
    }
    await expect(page.getByText(lockoutText)).toBeVisible();

    await test.step("correct password is still blocked", async () => {
      await app.login.password.fill(password);
      const res = await app.login.clickLogin();
      expect(res.status()).not.toBe(200);
      await expect(app.otp.heading).toBeHidden();
    });

    await test.step("login works again after the lockout period", async () => {
      await page.waitForTimeout(durationSec * 1000 + 5_000);
      await app.login.goto();
      await app.login.fill(username, password);
      await app.login.clickLogin();
      await app.otp.expectVisible();
      const res = await app.otp.submitCode(evaireConfig.otp.code);
      expect(res.status()).toBe(200);
      await expect(page).toHaveURL(/\/\?clientId=/);
    });
  });
});
