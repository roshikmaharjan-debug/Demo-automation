import { type Locator, type Page } from "@playwright/test";

class OtpPage {
  page: Page;
  heading: Locator;
  sentToText: Locator;
  codeBoxes: Locator;
  submitButton: Locator;
  backButton: Locator;
  resendCodeButton: Locator;
  timer: Locator;
  invalidOtpMessage: Locator;

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

  // Types the code one digit at a time, starting in the first box.
  // Ctrl+A before each digit replaces any digit that is already in the box.
  async enterCode(code: string) {
    await this.codeBoxes.first().focus();
    for (const digit of code) {
      await this.page.keyboard.press("ControlOrMeta+a");
      await this.page.keyboard.type(digit);
    }
  }

  async submitCode(code: string) {
    await this.enterCode(code);
    await this.submitButton.click();
  }

  // Pastes the code into the first box, like a user doing Ctrl+V.
  async pasteCode(code: string) {
    await this.codeBoxes.first().click();
    await this.codeBoxes.first().evaluate((box, text) => {
      const clipboard = new DataTransfer();
      clipboard.setData("text/plain", text);
      box.dispatchEvent(
        new ClipboardEvent("paste", {
          clipboardData: clipboard,
          bubbles: true,
        }),
      );
    }, code);
  }

  // Returns what is typed in the 6 boxes, e.g. "000000".
  async getEnteredCode() {
    const values = await this.codeBoxes.evaluateAll((boxes) =>
      boxes.map((box) => (box as HTMLInputElement).value),
    );
    return values.join("");
  }
}

export default OtpPage;
