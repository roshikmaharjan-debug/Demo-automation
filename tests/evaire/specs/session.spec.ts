import { expect, test } from "../fixtures/fixtures";
import { POMManager } from "../pages/POMManager";
import testData from "../data/testData.json";
import userCredentials from "../data/userCredentials.json";

// Test cases: TC-012, TC-020, TC-022
const user = userCredentials.Manager;

test.describe("Session", () => {
  test("TC-012 after logout, Back and Reload do not show the app", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, otpPage, homePage } = pomManager;

    await loginPage.loginAndEndOtherSession(user.Username, user.Password);
    await otpPage.submitCode(testData.otp);
    await expect(homePage.welcomeText).toBeVisible();

    await homePage.logout(user.Username);
    expect(await homePage.isLoggedIn()).toBe(false);

    // Browser Back
    await page.goBack();
    await expect(loginPage.username).toBeVisible();
    await expect(homePage.userMenu(user.Username)).toBeHidden();

    // Reload
    await page.reload();
    await expect(loginPage.username).toBeVisible();
    expect(await homePage.isLoggedIn()).toBe(false);
  });

  test("TC-020 a logged-in user opening /login goes to the home page", async ({
    page,
    pomManager,
  }) => {
    const { loginPage, otpPage, homePage } = pomManager;

    await loginPage.loginAndEndOtherSession(user.Username, user.Password);
    await otpPage.submitCode(testData.otp);
    await expect(homePage.welcomeText).toBeVisible();

    await loginPage.goto();
    await expect(page).toHaveURL(/\?clientId=/);
    await expect(loginPage.username).toBeHidden();
    await expect(homePage.welcomeText).toBeVisible();
  });

  test("TC-022 logging in on a second browser ends the first session", async ({
    browser,
    pomManager,
  }) => {
    // This test logs your account out everywhere else. Remove this line to run it.

    const { loginPage, otpPage, homePage } = pomManager;

    // Browser 1: log in
    await loginPage.loginAndEndOtherSession(user.Username, user.Password);
    await otpPage.submitCode(testData.otp);
    await expect(homePage.welcomeText).toBeVisible();

    // Browser 2: a new, separate browser window
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    const second = new POMManager(secondPage);

    await second.loginPage.goto();
    await second.loginPage.login(user.Username, user.Password);
    await expect(second.loginPage.activeSessionMessage).toBeVisible();
    await expect(second.otpPage.heading).toBeHidden();

    await second.loginPage.continueAndEndSessionButton.click();
    await second.otpPage.submitCode(testData.otp);
    await expect(second.homePage.welcomeText).toBeVisible();

    // Browser 1: refresh - the session has ended
    await pomManager.homePage.page.reload();
    await expect(loginPage.username).toBeVisible();

    await second.homePage.logoutIfLoggedIn();
    await secondContext.close();
  });
});
