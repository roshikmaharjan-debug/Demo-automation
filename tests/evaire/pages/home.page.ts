import { type Locator, type Page } from "@playwright/test";

// Backend the app calls to check who is logged in and to log out.
// Override with EVAIRE_API_URL to point the tests at another environment.
const API_URL = "https://api.login.qa.evaire.ai";
const CURRENT_USER_API = `${API_URL}/api/v1/auth/me`;
const LOGOUT_API = `${API_URL}/api/v1/auth/logout`;

class HomePage {
  readonly page: Page;
  readonly welcomeText: Locator;
  readonly clientSelector: Locator;
  readonly logOutMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeText = page.getByText("Welcome to the evaire product suite.");
    this.clientSelector = page.getByText("Client:");
    this.logOutMenuItem = page.getByRole("menuitem", { name: "Log Out" });
  }

  // The user menu in the top-right shows the username.
  userMenu(username: string) {
    return this.page.getByRole("button", { name: new RegExp(username) });
  }

  productCard(name: "Capture" | "Analyze" | "Manage") {
    return this.page.getByAltText(name, { exact: true });
  }

  async logout(username: string) {
    await this.userMenu(username).click();
    await this.logOutMenuItem.click();
  }

  // true when the browser has a valid login session.
  async isLoggedIn() {
    const response = await this.page.request.get(CURRENT_USER_API);
    return response.ok();
  }

  // Used after each test so the next test starts logged out.
  async logoutIfLoggedIn() {
    if (await this.isLoggedIn()) {
      await this.page.request.post(LOGOUT_API);
    }
  }
}

export default HomePage;
