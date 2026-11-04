import type { Page } from "@playwright/test";
import ForgotPasswordPage from "./forgot-password.page";
import HomePage from "./home.page";
import LoginPage from "./login.page";
import OtpPage from "./otp.page";

export class POMManager {
  public readonly loginPage: LoginPage;
  public readonly otpPage: OtpPage;
  public readonly forgotPasswordPage: ForgotPasswordPage;
  public readonly homePage: HomePage;

  constructor(page: Page) {
    this.loginPage = new LoginPage(page);
    this.otpPage = new OtpPage(page);
    this.forgotPasswordPage = new ForgotPasswordPage(page);
    this.homePage = new HomePage(page);
  }
}
