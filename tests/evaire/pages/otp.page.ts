import { type Locator, type Page } from "@playwright/test";

class OtpPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly sentToText: Locator;
  readonly codeBoxes: Locator;
  readonly submitButton: Locator;
  readonly backButton: Locator;
  readonly resendCodeButton: Locator;
  readonly timer: Locator;
  readonly invalidOtpMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText("Please enter the verification code");
    this.sentToText = page.getByText("We've sent you the code to");
    this.codeBoxes = page
      .getByRole("group", { name: "One-time password" })
      .getByRole("textbox");
    this.submitButton = page.getByRole("button", { name: "Submit" });
    this.backButton = page.getByRole("button", { name: "Back" });
    this.resendCodeButton = page.getByRole("button", {
      name: "Resend Code",
    });
    this.timer = page.getByText(/^\d:\d{2}$/); // e.g. 0:59
    this.invalidOtpMessage = page.getByText("Invalid OTP");
  }

  async enterCode(code: string) {
    await this.codeBoxes.first().focus();
    for (const digit of code) {
      await this.page.keyboard.type(digit);
    }
  }

  async submitCode(code: string) {
    await this.enterCode(code);
    await this.submitButton.click();
  }
}

export default OtpPage;
