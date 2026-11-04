import { type Locator, type Page } from "@playwright/test";

class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly showPasswordButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly usernameRequiredError: Locator;
  readonly passwordRequiredError: Locator;
  readonly activeSessionMessage: Locator;
  readonly continueAndEndSessionButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByPlaceholder("Enter your username or email");
    this.password = page.getByPlaceholder("Enter your password");
    // The eye icon has no name, so we find it next to the password field.
    this.showPasswordButton = page.locator(
      '[data-with-right-section="true"] button[tabindex="-1"]',
    );
    this.forgotPasswordLink = page.getByRole("link", {
      name: "Forgot Password?",
    });
    this.loginButton = page.getByRole("button", { name: "Login", exact: true });
    this.errorMessage = page.getByText(
      "The username/email or password you entered is incorrect. Please try again",
    );
    this.usernameRequiredError = page.getByText(
      "Username or email is required",
    );
    this.passwordRequiredError = page.getByText("Password is required");
    this.activeSessionMessage = page.getByText("Active session detected");
    this.continueAndEndSessionButton = page.getByRole("button", {
      name: "Continue & End Other Session",
    });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async fillCredentials(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
  }

  async login(username: string, password: string) {
    await this.fillCredentials(username, password);
    await this.loginButton.click();
  }

  // Use this when the login should reach the OTP screen.
  // The app allows one session per account, so if the account is logged in
  // somewhere else we click "Continue & End Other Session".
  async loginAndEndOtherSession(username: string, password: string) {
    await this.login(username, password);
    const otpHeading = this.page.getByText(
      "Please enter the verification code",
    );
    await otpHeading.or(this.continueAndEndSessionButton).waitFor();
    if (await this.continueAndEndSessionButton.isVisible()) {
      await this.continueAndEndSessionButton.click();
    }
    await otpHeading.waitFor();
  }
}

export default LoginPage;
