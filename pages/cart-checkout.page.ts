import { Locator, Page } from "@playwright/test";

class CartCheckoutPage {
  page: Page;
  checkoutButton: Locator;
  firstName: Locator;
  lastName: Locator;
  postalCode: Locator;
  continueButton: Locator;
  finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.getByRole("button", { name: "Checkout" });
    this.firstName = page.getByPlaceholder("First Name");
    this.lastName = page.getByPlaceholder("Last Name");
    this.postalCode = page.getByPlaceholder("Zip/Postal Code");
    this.continueButton = page.getByRole("button", { name: "Continue" });
    this.finishButton = page.getByRole("button", { name: "Finish" });
  }

  async startCheckout() {
    await this.checkoutButton.click();
  }

  async completeCustomerInformation(
    firstName: string,
    lastName: string,
    postalCode: string,
  ) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
    await this.continueButton.click();
  }

  async finishCheckout() {
    await this.finishButton.click();
  }
}

export default CartCheckoutPage;
