import { type Locator, type Page } from "@playwright/test";

class ForgotPasswordPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly email: Locator;
  readonly sendLinkButton: Locator;
  readonly backButton: Locator;
  readonly checkEmailHeading: Locator;
  readonly returnToLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText("Forgot Password", { exact: true });
    this.email = page.getByPlaceholder("Enter your email");
    this.sendLinkButton = page.getByRole("button", { name: "Send Link" });
    this.backButton = page.getByRole("link", { name: "Back" });
    this.checkEmailHeading = page.getByText("Please check your email");
    this.returnToLoginLink = page.getByRole("link", {
      name: "Return to Login",
    });
  }

  async sendLink(email: string) {
    await this.email.fill(email);
    await this.sendLinkButton.click();
  }
}

export default ForgotPasswordPage;
