import { expect, type Locator, type Page } from "@playwright/test";
import { messages } from "../config/evaireConfig";

export class EvaireForgotPasswordPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly instruction: Locator;
  readonly emailLabel: Locator;
  readonly email: Locator;
  readonly sendLinkBtn: Locator;
  readonly backLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText(messages.forgotHeading, { exact: true });
    this.instruction = page.getByText(messages.forgotInstruction);
    this.emailLabel = page.locator("label", { hasText: "Email" });
    this.email = page.getByPlaceholder("Enter your email");
    this.sendLinkBtn = page.getByRole("button", { name: "Send Link" });
    this.backLink = page.getByRole("link", { name: "Back" });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/forgot-password$/);
    await expect(this.heading).toBeVisible();
    await expect(this.instruction).toBeVisible();
    await expect(this.emailLabel).toContainText("Email *");
    await expect(this.email).toBeVisible();
    await expect(this.sendLinkBtn).toBeVisible();
    await expect(this.backLink).toBeVisible();
  }
}

export default EvaireForgotPasswordPage;
