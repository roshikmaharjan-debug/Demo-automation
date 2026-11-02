import { evaireConfig, messages, testData } from "../config/evaireConfig";
import { expect, test } from "../fixtures/evaire.fixtures";

/**
 * Eclat login - Login with credentials
 * Valid and invalid credentials, username vs email, duplicate submits.
 * Source: Eclat_Login_Test_Cases_v3 (TC-001, TC-002, TC-003, TC-005, TC-011, TC-014, TC-015, TC-021)
 */
const { username, password, email } = evaireConfig.user;
const OTP = evaireConfig.otp.code; // QA uses a fixed OTP (000000)
const TIMER_START = /^(1:00|0:5\d)$/;

test.describe("Eclat login - Login with credentials", () => {
  test("TC-001 successful login with valid credentials and OTP", async ({
    app,
    page,
  }) => {
    await app.login.goto();
    await app.login.expectLoaded();

    await app.login.username.fill(email || username);
    await expect(app.login.username).toHaveValue(email || username);
    await expect(app.login.username).toHaveAttribute("aria-invalid", "false");

    await app.login.password.fill(password);
    await expect(app.login.password).toHaveAttribute("type", "password");

    await app.loginToOtp(email || username, password);

    // OTP screen content
    await expect(app.otp.sentTo).toContainText(/\*+/); // masked email
    await expect(app.otp.timer).toHaveText(TIMER_START);
    await expect(app.otp.resendBtn).toBeDisabled();
    await expect(page.getByText(messages.otpSentToast)).toBeVisible();

    const res = await app.otp.submitCode(OTP);
    expect(res.status()).toBe(200);

    await app.home.expectLoaded(username);
  });

  test("TC-002 wrong password for an existing account is rejected", async ({
    app,
    page,
  }) => {
    await app.login.goto();
    await app.login.expectLoaded();

    const res = await app.login.submit(
      evaireConfig.user.username,
      testData.wrongPassword,
    );
    expect(res.status()).toBe(401);

    await app.login.expectLoginFailed();
    await expect(app.otp.heading).toBeHidden();
    // Fields keep their values, button disabled until a field changes.
    await expect(app.login.username).toHaveValue(evaireConfig.user.username);
    await expect(app.login.password).toHaveValue(testData.wrongPassword);
    await expect(app.login.loginBtn).toBeDisabled();
    // No stack trace / internals in the page.
    await expect(page.locator("body")).not.toContainText(
      /stack|exception|traceback|at \w+\.\w+ \(/i,
    );
    await expect(page).toHaveURL(/\/login$/);
  });

  test("TC-003 unregistered username/email gets the same generic error", async ({
    app,
    page,
  }) => {
    await app.login.goto();
    await app.login.expectLoaded();

    const t1 = Date.now();
    const unknown = await app.login.submit(
      testData.unregisteredEmail,
      testData.wrongPassword,
    );
    const unknownMs = Date.now() - t1;
    const unknownBody = await unknown.json();
    await app.login.expectLoginFailed();
    await expect(app.otp.heading).toBeHidden();

    // Compare with an existing account + wrong password (TC-002).
    await app.login.goto();
    const t2 = Date.now();
    const known = await app.login.submit(
      evaireConfig.user.username,
      testData.wrongPassword,
    );
    const knownMs = Date.now() - t2;
    const knownBody = await known.json();

    // Same status and identical message -> no account enumeration.
    expect(unknown.status()).toBe(known.status());
    expect(unknownBody.message).toBe(knownBody.message);
    expect(unknownBody.message).toBe(messages.loginFailed);
    await expect(page.getByText(messages.loginFailed)).toBeVisible();

    // No obvious timing difference (generous threshold for network noise).
    expect
      .soft(Math.abs(unknownMs - knownMs), "response time difference (ms)")
      .toBeLessThan(1500);
  });

  test("TC-005 username/email field accepts usernames and handles malformed input", async ({
    app,
    page,
  }) => {
    await app.login.goto();
    await app.login.expectLoaded();

    for (const value of testData.malformedIdentifiers) {
      await test.step(`identifier "${value}"`, async () => {
        await app.login.goto();
        const res = await app.login.submit(value, testData.wrongPassword);
        // Request is sent (no client-side email-format check) and rejected generically.
        expect(res.status()).toBe(401);
        await expect(page.getByText(/invalid email/i)).toBeHidden();
        await app.login.expectLoginFailed();

        // Layout holds: form still fully visible and inside the viewport.
        await expect(app.login.username).toBeInViewport();
        await expect(app.login.loginBtn).toBeInViewport();
        // Poll: the banner animates in and can overflow for a moment.
        await expect
          .poll(
            () =>
              page.evaluate(
                () =>
                  document.documentElement.scrollWidth >
                  document.documentElement.clientWidth,
              ),
            { message: "no horizontal overflow" },
          )
          .toBe(false);
      });
    }
  });

  test("TC-011 username/email is case-insensitive and trimmed; password is case-sensitive", async ({
    app,
  }) => {
    test.skip(!email, "Set EVAIRE_EMAIL in .env to run TC-011");

    const mixedCase = email
      .split("")
      .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
      .join("");
    const padded = `  ${email.toLowerCase()}  `;
    const swappedCasePassword = password
      .split("")
      .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
      .join("");

    await test.step("mixed-case email reaches OTP", async () => {
      await app.login.goto();
      await app.loginToOtp(mixedCase, password);
      await app.otp.backBtn.click();
      await expect(app.login.username).toBeVisible();
    });

    await test.step("email with leading/trailing spaces reaches OTP", async () => {
      await app.login.goto();
      await app.loginToOtp(padded, password);
      await app.otp.backBtn.click();
      await expect(app.login.username).toBeVisible();
    });

    await test.step("password with changed case is rejected", async () => {
      await app.login.goto();
      const res = await app.login.submit(email, swappedCasePassword);
      expect(res.status()).toBe(401);
      await app.login.expectLoginFailed();
      await expect(app.otp.heading).toBeHidden();
    });
  });

  test("TC-014 double-click on Login sends a single login request", async ({
    app,
    page,
  }) => {
    await app.login.goto();
    await app.login.fill(username, password);

    const loginRequests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/auth/login") && r.method() === "POST")
        loginRequests.push(r.postData() ?? "");
    });

    await app.login.loginBtn.dblclick();
    await expect(
      app.otp.heading.or(app.login.continueEndSessionBtn),
    ).toBeVisible({ timeout: 15_000 });
    expect(loginRequests, "only one /auth/login request").toHaveLength(1);

    if (await app.login.continueEndSessionBtn.isVisible()) {
      await app.login.continueEndSessionBtn.click();
    }
    await app.otp.expectVisible();

    // No late duplicate request either.
    await page.waitForTimeout(3_000);
    expect(loginRequests).toHaveLength(1);
  });

  test("TC-015 login with username instead of email", async ({ app }) => {
    await app.login.goto();
    await app.login.username.fill(username);
    await expect(app.login.username).toHaveAttribute("aria-invalid", "false");

    await app.loginToOtp(username, password);
    await expect(app.otp.sentTo).toContainText(/\S+\*+\S*@\S+\.\S+/);

    const res = await app.otp.submitCode(OTP);
    expect(res.status()).toBe(200);
    await app.home.expectLoaded(username);
  });

  test("TC-021 Login button disabled after a failed attempt until input changes", async ({
    app,
  }) => {
    await app.login.goto();
    await app.login.expectLoaded();

    await app.login.submit(testData.unregisteredEmail, testData.wrongPassword);
    await app.login.expectLoginFailed();

    await expect(app.login.loginBtn).toBeDisabled();

    // Change one character
    await app.login.password.fill(testData.wrongPassword + "x");
    await expect(app.login.loginBtn).toBeEnabled();
  });
});
