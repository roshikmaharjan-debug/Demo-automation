import { evaireConfig, messages } from "../config/evaireConfig";
import { expect, test } from "../fixtures/evaire.fixtures";

/**
 * Eclat login - OTP verification
 * Wrong/short codes, timer and resend, back, paste.
 * Source: Eclat_Login_Test_Cases_v3 (TC-016, TC-017, TC-018, TC-019)
 */
const { username } = evaireConfig.user;
const OTP = evaireConfig.otp.code; // QA uses a fixed OTP (000000)
const TIMER_START = /^(1:00|0:5\d)$/;

test.describe("Eclat login - OTP verification", () => {
  test("TC-016 wrong or incomplete OTP is rejected", async ({ app, page }) => {
    await app.login.goto();
    await app.loginToOtp();

    // Run on empty boxes first (letters, short code), then the full wrong code,
    // because Mantine's PinInput can't be reliably cleared once filled.
    await test.step("letters are blocked", async () => {
      await app.otp.pins.first().click();
      await page.keyboard.type("abcdef");
      const blocked = (await app.otp.values()) === "";
      const message = page.getByText(/OTP must contain only numbers/i);
      expect(blocked || (await message.isVisible())).toBe(true);
    });

    await test.step("3 digits only", async () => {
      await app.otp.enterCode("123");
      await app.otp.submitBtn.click();
      await expect(page.getByText(messages.otpMustBe6)).toBeVisible();
      await expect(app.otp.heading).toBeVisible();
    });

    await test.step(`wrong code ${evaireConfig.otp.wrongCode}`, async () => {
      const res = await app.otp.submitCode(evaireConfig.otp.wrongCode);
      expect(res.status(), "wrong OTP must be rejected").toBe(400);
      await expect(page.getByText(messages.otpInvalid)).toBeVisible();
      await expect(app.otp.heading).toBeVisible();
      expect(await app.isAuthenticated()).toBe(false);
    });
  });

  test("TC-017 OTP countdown, expiry and Resend Code", async ({
    app,
    page,
  }) => {
    test.setTimeout(240_000);
    await app.login.goto();
    await app.loginToOtp();

    await expect(app.otp.timer).toHaveText(TIMER_START);
    await expect(app.otp.resendBtn).toBeDisabled();

    await expect(app.otp.timer).toHaveText("0:00", { timeout: 75_000 });
    await expect(app.otp.resendBtn).toBeEnabled();

    await app.otp.resendBtn.click();
    // "Sending..." can be too brief to catch, so record it instead of failing.
    const sawSending = await page
      .getByText("Sending...")
      .waitFor({ timeout: 3_000 })
      .then(
        () => true,
        () => false,
      );
    test.info().annotations.push({
      type: "Sending... shown",
      description: String(sawSending),
    });
    await expect(app.otp.timer).toHaveText(TIMER_START, { timeout: 15_000 });
    await expect(app.otp.resendBtn).toBeDisabled();

    // With the fixed QA OTP the old and new codes are the same, so the
    // "old code rejected" check from the sheet can't be automated here.
    test.info().annotations.push({
      type: "note",
      description: "Old-code rejection not checked: QA uses a fixed OTP.",
    });
    const res = await app.otp.submitCode(OTP);
    expect(res.status()).toBe(200);
    await app.home.expectLoaded(username);
  });

  test("TC-018 Back from the OTP screen does not authenticate", async ({
    app,
    page,
  }) => {
    await app.login.goto();
    await app.loginToOtp();

    await app.otp.backBtn.click();
    await expect(app.login.username).toBeVisible();
    await expect(app.otp.heading).toBeHidden();
    expect(await app.isAuthenticated()).toBe(false);

    // Logging in again sends a new OTP
    await app.login.goto();
    await app.loginToOtp();
    await expect(page.getByText(messages.otpSentToast)).toBeVisible();
    const res = await app.otp.submitCode(OTP);
    expect(res.status()).toBe(200);
    await app.home.expectLoaded(username);
  });

  test("TC-019 pasting a 6-digit OTP fills all boxes", async ({ app }) => {
    await app.login.goto();
    await app.loginToOtp();

    await app.otp.pasteCode(OTP);
    await expect.poll(() => app.otp.values()).toBe(OTP);

    const res = await app.otp.submit();
    expect(res.status()).toBe(200);
    await app.home.expectLoaded(username);
  });
});
