import {
  expect,
  type Locator,
  type Page,
  type Response,
} from "@playwright/test";
import { messages } from "../config/evaireConfig";

/** Page object for https://login.qa.evaire.ai/login */
export class EvaireLoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly usernameLabel: Locator;
  readonly passwordLabel: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly passwordToggle: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loginBtn: Locator;
  readonly errorBanner: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly activeSessionTitle: Locator;
  readonly continueEndSessionBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText("Login", { exact: true }).first();
    this.usernameLabel = page.locator("label", { hasText: "Username/Email" });
    this.passwordLabel = page.locator("label", { hasText: "Password" });
    this.username = page.getByPlaceholder("Enter your username or email");
    this.password = page.getByPlaceholder("Enter your password");
    // Eye icon: aria-hidden + tabindex=-1, so it has no accessible role.
    this.passwordToggle = page.locator(
      '[data-with-right-section="true"] button[tabindex="-1"]',
    );
    this.forgotPasswordLink = page.getByRole("link", {
      name: "Forgot Password?",
    });
    this.loginBtn = page.getByRole("button", { name: "Login", exact: true });
    this.errorBanner = page
      .getByText(messages.loginFailedTitle, { exact: true })
      .locator("..");
    this.usernameError = page.getByText(messages.usernameRequired);
    this.passwordError = page.getByText(messages.passwordRequired);
    this.activeSessionTitle = page.getByText(messages.activeSession);
    this.continueEndSessionBtn = page.getByRole("button", {
      name: messages.continueEndSession,
    });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async expectLoaded() {
    await expect(this.page).toHaveTitle(messages.pageTitle);
    await expect(this.username).toBeVisible();
    await expect(this.password).toBeVisible();
    await expect(this.usernameLabel).toContainText("Username/Email *");
    await expect(this.passwordLabel).toContainText("Password *");
    await expect(this.forgotPasswordLink).toBeVisible();
    await expect(this.loginBtn).toBeVisible();
    await expect(this.page.getByAltText("Evaire Logo")).toBeVisible();
  }

  async fill(identifier: string, password: string) {
    await this.username.fill(identifier);
    await this.password.fill(password);
  }

  /** Fill and click Login, returning the /auth/login response. */
  async submit(identifier: string, password: string): Promise<Response> {
    await this.fill(identifier, password);
    return this.clickLogin();
  }

  async clickLogin(): Promise<Response> {
    const responsePromise = this.page.waitForResponse(
      (r) => r.url().includes("/auth/login") && r.request().method() === "POST",
    );
    await this.loginBtn.click();
    return responsePromise;
  }

  async expectLoginFailed() {
    await expect(
      this.page.getByText(messages.loginFailedTitle, { exact: true }),
    ).toBeVisible();
    await expect(this.page.getByText(messages.loginFailed)).toBeVisible();
    await expect(this.page).toHaveURL(/\/login$/);
  }
}

export default EvaireLoginPage;
