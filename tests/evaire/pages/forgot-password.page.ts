import { type Locator, type Page } from "@playwright/test";

class ForgotPasswordPage {
  page: Page;
  heading: Locator;
  email: Locator;
  sendLinkButton: Locator;
  backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText("Forgot Password", { exact: true });
    this.email = page.getByPlaceholder("Enter your email");
    this.sendLinkButton = page.getByRole("button", { name: "Send Link" });
    this.backButton = page.getByRole("link", { name: "Back" });
  }

  async sendLink(email: string) {
    await this.email.fill(email);
    await this.sendLinkButton.click();
  }
}

export default ForgotPasswordPage;
