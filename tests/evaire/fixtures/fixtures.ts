import { test as base } from "@playwright/test";
import { POMManager } from "../pages/POMManager";

type EvaireFixtures = {
  pomManager: POMManager;
};

export const test = base.extend<EvaireFixtures>({
  pomManager: async ({ page }, use) => {
    const pomManager = new POMManager(page);
    // Every test starts on the login page.
    await pomManager.loginPage.goto();

    await use(pomManager);

    // Log out after the test. The app allows one session per account,
    // so this stops the next test from seeing "Active session detected".
    await pomManager.homePage.logoutIfLoggedIn();
  },
});

export { expect } from "@playwright/test";
