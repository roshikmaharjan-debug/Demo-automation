import { expect, test } from "../fixtures/fixtures";
import testData from "../data/testData.json";
import userCredentials from "../data/userCredentials.json";

// Test case: TC-013 (only if a lockout policy is documented)

// Fill these in from the documented lockout policy.
const FAILED_ATTEMPTS_BEFORE_LOCKOUT = 5;
const LOCKOUT_MINUTES = 15;
// Use an account that is OK to lock, not your main account.
const lockoutUser = userCredentials.QAL3;

test.describe("Lockout", () => {
  test("TC-013 account is locked after too many wrong passwords", async ({
    page,
    pomManager,
  }) => {
    // Turned off until the lockout policy is confirmed. Remove this line to run it.
    test.skip(true, "Lockout policy is not documented yet.");
    test.setTimeout((LOCKOUT_MINUTES + 3) * 60 * 1000);

    const { loginPage, otpPage } = pomManager;
    const lockoutMessage = page.getByText(/lock|too many|try again later/i);

    // Wrong password several times (add a number so the button re-enables)
    await loginPage.username.fill(lockoutUser.Username);
    for (let i = 1; i <= FAILED_ATTEMPTS_BEFORE_LOCKOUT; i++) {
      await loginPage.password.fill(testData.wrongPassword + i);
      await loginPage.loginButton.click();
      await expect(loginPage.errorMessage.or(lockoutMessage)).toBeVisible();
    }
    await expect(lockoutMessage).toBeVisible();

    // Even the correct password is blocked now
    await loginPage.password.fill(lockoutUser.Password);
    await loginPage.loginButton.click();
    await expect(otpPage.heading).toBeHidden();

    // After the lockout time, login works again
    await page.waitForTimeout(LOCKOUT_MINUTES * 60 * 1000);
    await loginPage.goto();
    await loginPage.loginAndEndOtherSession(
      lockoutUser.Username,
      lockoutUser.Password,
    );
    await otpPage.submitCode(testData.otp);
    await expect(page).toHaveURL(/\?clientId=/);
  });
});
