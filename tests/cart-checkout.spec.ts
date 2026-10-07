import { expect, test } from "../fixtures/fixtures.ts";

test.describe("Cart and checkout", () => {
  test("adds two items to the cart", async ({ page, inventoryPage }) => {
    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await inventoryPage.addItemToCart("Sauce Labs Bike Light");
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(
      "2",
    );
  });

  test("completes an order and shows confirmation", async ({
    page,
    cartCheckoutPage,
    inventoryPage,
  }) => {
    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await inventoryPage.goToCart();
    await cartCheckoutPage.startCheckout();
    await cartCheckoutPage.completeCustomerInformation(
      "Roshik",
      "Maharjan",
      "44600",
    );

    await expect(page).toHaveURL(/checkout-step-two.html/);
    await expect(page.locator('[data-test="total-label"]')).toBeVisible();
    await cartCheckoutPage.finishCheckout();

    await expect(page.getByText("Thank you for your order!")).toBeVisible();
  });
});
