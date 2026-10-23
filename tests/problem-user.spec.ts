import { expect, test } from "../fixtures/fixtures.ts";
import CartCheckoutPage from "../pages/cart-checkout.page";
import InventoryPage from "../pages/inventory.page";

test.describe("Problem user", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  // Bug: entering the last name overwrites the first-name field; checkout should retain both values.
  test("completes checkout", async ({ page, loginPage }) => {
    test.fail();
    test.info().annotations.push({
      type: "issue",
      description: "Problem user checkout overwrites the first name with the last name.",
    });

    await loginPage.login("problem_user", "secret_sauce");
    const inventoryPage = new InventoryPage(page);
    const cartCheckoutPage = new CartCheckoutPage(page);
    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await inventoryPage.goToCart();
    await cartCheckoutPage.startCheckout();

    await cartCheckoutPage.completeCustomerInformation("Test", "User", "12345");
    await expect(page).toHaveURL(/checkout-step-two\.html/);
  });
});