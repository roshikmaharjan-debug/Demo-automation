import { type Locator, type Page } from "@playwright/test";

class ForgotPasswordPage {
  page: Page;
  heading: Locator;
  email: Locator;
  sendLinkButton: Locator;
  backButton: Locator;
  heading2: Locator;
  return: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText("Forgot Password", { exact: true });
    this.email = page.getByPlaceholder("Enter your email");
    this.sendLinkButton = page.getByRole("button", { name: "Send Link" });
    this.backButton = page.getByRole("link", { name: "Back" });
    this.heading2 = page.getByText("Please check your email");
    this.return = page.getByRole("link", { name: "Return to Login" });
  }

  async sendLink(email: string) {
    await this.email.fill(email);
    await this.sendLinkButton.click();
  }
}

export default ForgotPasswordPage;
