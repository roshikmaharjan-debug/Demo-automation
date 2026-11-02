import { expect, type Locator, type Page } from "@playwright/test";
import { messages } from "../config/evaireConfig";

/** Product suite home: /?clientId=<id> */
export class EvaireHomePage {
  readonly page: Page;
  readonly welcome: Locator;
  readonly clientLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcome = page.getByText(messages.welcome);
    this.clientLabel = page.getByText("Client:");
  }

  userMenu(username: string): Locator {
    return this.page.getByRole("button", { name: new RegExp(username, "i") });
  }

  async expectLoaded(username: string) {
    await expect(this.page).toHaveURL(/\/\?clientId=[\w-]+/, {
      timeout: 20_000,
    });
    await expect(this.welcome).toBeVisible();
    await expect(this.clientLabel).toBeVisible();
    await expect(this.userMenu(username)).toBeVisible();
    for (const card of ["Capture", "Analyze", "Manage"]) {
      await expect(this.page.getByAltText(card, { exact: true })).toBeVisible();
    }
  }

  async logout(username: string) {
    await this.userMenu(username).click();
    await this.page.getByRole("menuitem", { name: "Log Out" }).click();
    await expect(this.page).toHaveURL(/\/logged-out|\/login/);
  }
}

export default EvaireHomePage;
