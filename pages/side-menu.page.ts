import { Locator, Page } from "@playwright/test";

class SideMenuPage {
  menuButton: Locator;
  logoutButton: Locator;
  catalogButton: Locator;
  spinnerButton: Locator;
  aboutLink: Locator;

  constructor(page: Page) {
    this.menuButton = page.getByRole("button", { name: "Open Menu" });
    this.logoutButton = page.getByRole("button", { name: "Logout" });
    this.catalogButton = page.getByRole("button", {
      name: "Dynamic Catalog",
    });
    this.spinnerButton = page.getByRole("button", { name: "Spinner" });
    this.aboutLink = page.getByRole("link", { name: "About" });
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutButton.click();
  }

  async openSpinner() {
    await this.menuButton.click();
    await this.catalogButton.click();
    await this.spinnerButton.click();
  }

  async openAbout() {
    await this.menuButton.click();
    await this.aboutLink.click();
  }
}

export default SideMenuPage;
