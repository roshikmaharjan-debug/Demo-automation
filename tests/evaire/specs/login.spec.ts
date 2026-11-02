import { expect, test } from "../fixtures/fixtures";
import testData from "../data/testData.json";
import userCredentials from "../data/userCredentials.json";

// Test cases: TC-001, TC-002, TC-003, TC-005, TC-011, TC-014, TC-015, TC-021
const user = userCredentials.Coder;

test.describe("Login", () => {
  test("TC-001 logs in with valid credentials and OTP", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, otpPage, homePage } = pomManager;

    await loginPage.loginAndEndOtherSession(user.Username, user.Password);

    // OTP screen
    await expect(otpPage.heading).toBeVisible();
    await expect(otpPage.sentToText).toContainText("***");
    await expect(otpPage.codeBoxes).toHaveCount(6);
    await expect(otpPage.resendCodeButton).toBeDisabled();
    await expect(page.getByText("OTP sent to your email")).toBeVisible();

    await otpPage.submitCode(testData.otp);

    // Product suite home
    await expect(page).toHaveURL(/\?clientId=/);
    await expect(homePage.welcomeText).toBeVisible();
    await expect(homePage.clientSelector).toBeVisible();
    await expect(homePage.userMenu(user.Username)).toBeVisible();
    await expect(homePage.productCard("Capture")).toBeVisible();

  });

  test("TC-002 shows an error for a wrong password", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, otpPage } = pomManager;

    await loginPage.login(user.Username, testData.wrongPassword);


    await expect(loginPage.errorMessage).toBeVisible();
    await expect(otpPage.heading).toBeHidden();
    await expect(page).toHaveURL(/\/login$/);

    // The fields keep their values and Login is disabled until something changes.
    await expect(loginPage.username).toHaveValue(user.Username);
    await expect(loginPage.password).toHaveValue(testData.wrongPassword);
    await expect(loginPage.loginButton).toBeDisabled();
  });

  test("TC-003 shows the same error for an unregistered user", async ({
    pomManager,
  }) => {
    const { loginPage, otpPage } = pomManager;

    // Unregistered email
    let start = Date.now();
    await loginPage.login(testData.unregisteredEmail, testData.wrongPassword);
    await expect(loginPage.errorMessage).toBeVisible();
    const unregisteredTime = Date.now() - start;
    await expect(otpPage.heading).toBeHidden();

    // Registered user with a wrong password - should get the exact same message
    await loginPage.goto();
    start = Date.now();
    await loginPage.login(user.Username, testData.wrongPassword);
    await expect(loginPage.errorMessage).toBeVisible();
    const registeredTime = Date.now() - start;

    // Response times should be about the same (no hint that the account exists)
    expect(Math.abs(unregisteredTime - registeredTime)).toBeLessThan(1500);
  });

  test("TC-005 accepts any text in the username field and shows the normal error", async ({
    page,
    pomManager,
  }) => {
    const { loginPage } = pomManager;

    for (const value of testData.malformedUsernames) {
      await loginPage.goto();
      await loginPage.login(value, testData.wrongPassword);

      await expect(loginPage.errorMessage).toBeVisible();
    }
  });

  test.only("TC-011 email ignores case and spaces, password does not", async ({
    pomManager,
  }) => {
    const { loginPage, otpPage } = pomManager;

    // Upper-case email reaches the OTP screen
    await loginPage.loginAndEndOtherSession(
      user.Username.toUpperCase(),
      user.Password,
    );
    await expect(otpPage.heading).toBeVisible();
    await otpPage.backButton.click();

    // Email with spaces around it reaches the OTP screen
    await loginPage.goto();
    await loginPage.loginAndEndOtherSession(`  ${user.Username}  `, user.Password);
    await expect(otpPage.heading).toBeVisible();
    await otpPage.backButton.click();

    // Password in the wrong case is rejected
    await loginPage.goto();
    await loginPage.login(user.Username, user.Password.toUpperCase());
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(otpPage.heading).toBeHidden();
  });

  test("TC-014 double-clicking Login sends only one request", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, otpPage } = pomManager;

    // Count the login requests the page sends
    let loginRequests = 0;
    page.on("request", (request) => {
      if (request.url().includes("/auth/login") && request.method() === "POST")
        loginRequests++;
    });

    await loginPage.fillCredentials(user.Username, user.Password);
    await loginPage.loginButton.dblclick();
    await expect(
      otpPage.heading.or(loginPage.continueAndEndSessionButton),
    ).toBeVisible();

    expect(loginRequests).toBe(1);
  });

  test("TC-015 logs in with username instead of email", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, otpPage, homePage } = pomManager;

    await loginPage.loginAndEndOtherSession(user.Username, user.Password);
    // The OTP screen shows the account's masked email, e.g. r***n@maitriservices.com
    await expect(otpPage.sentToText).toContainText("***");
    await expect(otpPage.sentToText).toContainText("@");

    await otpPage.submitCode(testData.otp);
    await expect(page).toHaveURL(/\?clientId=/);
    await expect(homePage.welcomeText).toBeVisible();
  });

  test("TC-021 Login button is disabled after a failed login until a field changes", async ({
    pomManager,
  }) => {
    const { loginPage } = pomManager;

    await loginPage.login(testData.unregisteredEmail, testData.wrongPassword);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.loginButton).toBeDisabled();

    // Change one character
    await loginPage.password.fill(testData.wrongPassword + "x");
    await expect(loginPage.loginButton).toBeEnabled();
  });
});
