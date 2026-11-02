import {
  expect,
  type Locator,
  type Page,
  type Response,
} from "@playwright/test";
import { messages } from "../config/evaireConfig";

/** The 6-box verification-code step shown after a successful credential check. */
export class EvaireOtpPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly sentTo: Locator;
  readonly pinGroup: Locator;
  readonly pins: Locator;
  readonly submitBtn: Locator;
  readonly backBtn: Locator;
  readonly resendBtn: Locator;
  readonly timer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText(messages.otpHeading);
    this.sentTo = page.getByText(messages.otpSentTo);
    this.pinGroup = page.getByRole("group", { name: "One-time password" });
    this.pins = this.pinGroup.getByRole("textbox");
    this.submitBtn = page.getByRole("button", { name: "Submit" });
    this.backBtn = page.getByRole("button", { name: "Back" });
    this.resendBtn = page.getByRole("button", { name: /Resend Code|Sending/ });
    this.timer = page.getByText(/^\d:\d{2}$/);
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
    await expect(this.sentTo).toContainText(/\S+\*+\S*@\S+/);
    await expect(this.pins).toHaveCount(6);
    await expect(this.submitBtn).toBeVisible();
    await expect(this.backBtn).toBeVisible();
  }

  /**
   * Types the code starting at the first box. Each character is typed over a
   * select-all, so any existing digits are overwritten (Mantine PinInput keeps
   * the old digit otherwise). For codes shorter than 6, start from empty boxes.
   */
  async enterCode(code: string) {
    await this.pins.first().focus();
    for (const ch of code) {
      await this.page.keyboard.press("ControlOrMeta+a");
      await this.page.keyboard.type(ch);
    }
  }

  async values(): Promise<string> {
    return (
      await this.pins.evaluateAll((els) =>
        els.map((e) => (e as HTMLInputElement).value),
      )
    ).join("");
  }

  /** Simulates the user pasting a code into the first box. */
  async pasteCode(code: string) {
    await this.pins.first().click();
    await this.pins.first().evaluate((el, text) => {
      const dt = new DataTransfer();
      dt.setData("text/plain", text);
      el.dispatchEvent(
        new ClipboardEvent("paste", {
          clipboardData: dt,
          bubbles: true,
          cancelable: true,
        }),
      );
    }, code);
  }

  async submit(): Promise<Response> {
    const responsePromise = this.page.waitForResponse(
      (r) =>
        r.url().includes("/auth/verify-otp") && r.request().method() === "POST",
    );
    await this.submitBtn.click();
    return responsePromise;
  }

  async submitCode(code: string): Promise<Response> {
    await this.enterCode(code);
    return this.submit();
  }
}

export default EvaireOtpPage;
