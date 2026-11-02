import { test as base, expect, type Page } from "@playwright/test";
import { evaireConfig } from "../config/evaireConfig";
import EvaireForgotPasswordPage from "../pages/forgot-password.page";
import EvaireHomePage from "../pages/home.page";
import EvaireLoginPage from "../pages/login.page";
import EvaireOtpPage from "../pages/otp.page";

export type LoginOptions = {
  /** Click "Continue & End Other Session" automatically if it appears (default true). */
  autoEndOtherSession?: boolean;
};

/** All evaire page objects + login helpers bound to one page. */
export class EvaireApp {
  readonly login: EvaireLoginPage;
  readonly otp: EvaireOtpPage;
  readonly forgot: EvaireForgotPasswordPage;
  readonly home: EvaireHomePage;

  constructor(readonly page: Page) {
    this.login = new EvaireLoginPage(page);
    this.otp = new EvaireOtpPage(page);
    this.forgot = new EvaireForgotPasswordPage(page);
    this.home = new EvaireHomePage(page);
  }

  /**
   * Submits credentials and waits for the OTP screen.
   */
  async loginToOtp(
    identifier = evaireConfig.user.username,
    password = evaireConfig.user.password,
    { autoEndOtherSession = true }: LoginOptions = {},
  ): Promise<void> {
    await this.login.fill(identifier, password);
    await this.login.clickLogin();

    await expect(
      this.otp.heading.or(this.login.continueEndSessionBtn),
    ).toBeVisible({ timeout: 15_000 });

    if (await this.login.continueEndSessionBtn.isVisible()) {
      if (!autoEndOtherSession) return;
      await this.login.continueEndSessionBtn.click();
    }
    await this.otp.expectVisible();
  }

  /** Full login: credentials -> fixed QA OTP -> product suite home. */
  async fullLogin(
    identifier = evaireConfig.user.username,
    password = evaireConfig.user.password,
    options?: LoginOptions,
  ) {
    await this.login.goto();
    await this.loginToOtp(identifier, password, options);
    const res = await this.otp.submitCode(evaireConfig.otp.code);
    expect(res.status(), "verify-otp should succeed").toBe(200);
    await this.home.expectLoaded(evaireConfig.user.username);
  }

  /** Calls GET /auth/me with the page's cookies. */
  async isAuthenticated(): Promise<boolean> {
    const res = await this.page.request.get(
      `${evaireConfig.apiBaseUrl}/api/v1/auth/me`,
    );
    return res.ok();
  }

  /** Ends the current server session (cleanup so later tests don't hit "Active session detected"). */
  async logoutViaApi() {
    await this.page.request
      .post(`${evaireConfig.apiBaseUrl}/api/v1/auth/logout`)
      .catch(() => undefined);
  }
}

export const test = base.extend<{ app: EvaireApp }>({
  app: async ({ page }, use) => {
    const app = new EvaireApp(page);
    await use(app);
    // Free the account for the next test (one active session per account).
    if (await app.isAuthenticated().catch(() => false))
      await app.logoutViaApi();
  },
});

export { expect };
