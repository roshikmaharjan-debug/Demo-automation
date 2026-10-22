import { expect, test } from "../fixtures/fixtures.ts";
import CartCheckoutPage from "../pages/cart-checkout.page";
import InventoryPage from "../pages/inventory.page";

test.describe("Problem user", () => {
  

  // Bug: entering the last name overwrites the first-name field; checkout should retain both values.
  test("completes checkout", async ({ page, loginPage }) => {
    await loginPage.login("problem_user", "secret_sauce");
    const inventoryPage = new InventoryPage(page);
    const cartCheckoutPage = new CartCheckoutPage(page);
    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await inventoryPage.goToCart();
    await cartCheckoutPage.startCheckout();

    await cartCheckoutPage.completeCustomerInformation("Test", "User", "12345");
    await expect(cartCheckoutPage.firstName).toHaveValue("Test");
    await expect(cartCheckoutPage.lastName).toHaveValue("User");
    await cartCheckoutPage.continueButton.click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await cartCheckoutPage.finishCheckout();
    await expect(page.getByText("Thank you for your order!")).toBeVisible();
  });
});