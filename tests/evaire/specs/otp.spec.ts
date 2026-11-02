import { expect, test } from "../fixtures/fixtures";
import testData from "../data/testData.json";
import userCredentials from "../data/userCredentials.json";

// Test cases: TC-016, TC-017, TC-018, TC-019
const user = userCredentials.Manager;

test.describe("OTP", () => {
  test("TC-016 rejects letters, short codes and a wrong code", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, otpPage, homePage } = pomManager;
    await loginPage.loginAndEndOtherSession(user.Username, user.Password);

    // Letters can't be typed
    await otpPage.codeBoxes.first().click();
    await page.keyboard.type("abcdef");
    expect(await otpPage.getEnteredCode()).toBe("");

    // Only 3 digits
    await otpPage.submitCode("123");
    await expect(page.getByText("OTP must be 6 digits")).toBeVisible();

    // Wrong 6-digit code
    await otpPage.submitCode(testData.wrongOtp);
    await expect(otpPage.invalidOtpMessage).toBeVisible();
    await expect(otpPage.heading).toBeVisible();
    expect(await homePage.isLoggedIn()).toBe(false);
  });

  test("TC-017 timer counts down and Resend Code works", async ({
    page,
    pomManager,
  }) => {
    test.setTimeout(3 * 60 * 1000); // waits for the full 1-minute timer

    const { loginPage, otpPage, homePage } = pomManager;
    await loginPage.loginAndEndOtherSession(user.Username, user.Password);

    // Timer starts at about 1:00 and Resend is disabled
    await expect(otpPage.timer).toHaveText(/^(1:00|0:5\d)$/);
    await expect(otpPage.resendCodeButton).toBeDisabled();

    // When the timer reaches 0:00, Resend is enabled
    await expect(otpPage.timer).toHaveText("0:00", { timeout: 75_000 });
    await expect(otpPage.resendCodeButton).toBeEnabled();

    // Resend restarts the timer
    await otpPage.resendCodeButton.click();
    await expect(otpPage.timer).toHaveText(/^(1:00|0:5\d)$/);
    await expect(otpPage.resendCodeButton).toBeDisabled();

    // Note: QA uses the same OTP every time, so we can't check that the old
    // code stops working. We just check the code still logs in.
    await otpPage.submitCode(testData.otp);
    await expect(page).toHaveURL(/\?clientId=/);
    await expect(homePage.welcomeText).toBeVisible();
  });

  test("TC-018 Back on the OTP screen returns to login without logging in", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, otpPage, homePage } = pomManager;
    await loginPage.loginAndEndOtherSession(user.Username, user.Password);

    await otpPage.backButton.click();
    await expect(loginPage.username).toBeVisible();
    await expect(otpPage.heading).toBeHidden();
    expect(await homePage.isLoggedIn()).toBe(false);

    // Logging in again sends a new OTP
    await loginPage.goto();
    await loginPage.loginAndEndOtherSession(user.Username, user.Password);
    await expect(page.getByText("OTP sent to your email")).toBeVisible();
    await otpPage.submitCode(testData.otp);
    await expect(homePage.welcomeText).toBeVisible();
  });

  test("TC-019 pasting the OTP fills all 6 boxes", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, otpPage, homePage } = pomManager;
    await loginPage.loginAndEndOtherSession(user.Username, user.Password);

    await otpPage.pasteCode(testData.otp);
    await expect.poll(() => otpPage.getEnteredCode()).toBe(testData.otp);

    await otpPage.submitButton.click();
    await expect(page).toHaveURL(/\?clientId=/);
    await expect(homePage.welcomeText).toBeVisible();
  });
});
