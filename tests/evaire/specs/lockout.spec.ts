import { expect, test } from "../fixtures/fixtures";
import testData from "../data/testData.json";
import userCredentials from "../data/userCredentials.json";

// Test case: TC-013 (only if a lockout policy is documented)
// Skipped until the lockout policy is confirmed. Before un-skipping, replace
// this placeholder with the documented number of attempts and check the
// lockout message text below. Uses QAL2 so a lockout never blocks Coder.
const FAILED_ATTEMPTS_BEFORE_LOCKOUT = 5;

const lockoutUser = userCredentials.QAL2;

test.describe("Lockout", () => {
  test.skip("TC-013 account is locked after too many wrong passwords", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, otpPage } = pomManager;
    const lockoutMessage = page.getByText("Account temporarily locked");

    await loginPage.username.fill(lockoutUser.Username);
    for (let i = 1; i <= FAILED_ATTEMPTS_BEFORE_LOCKOUT; i++) {
      await loginPage.password.fill(testData.wrongPassword + i);
      const response = page.waitForResponse("**/auth/login");
      await loginPage.loginButton.click();
      await response; // wait until this attempt is finished
    }
    await expect(lockoutMessage).toBeVisible();

    await loginPage.password.fill(lockoutUser.Password);
    const response = page.waitForResponse("**/auth/login");
    await loginPage.loginButton.click();
    await response;
    await expect(lockoutMessage).toBeVisible();
    await expect(otpPage.heading).toBeHidden();
  });
});
