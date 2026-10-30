import { expect, test } from "./fixtures/fixtures";

test.describe("Cart and checkout", () => {
  test("adds two items to the cart", async ({ page, pomManager }) => {
    await pomManager.inventoryPage.addItemToCart("Sauce Labs Backpack");
    await pomManager.inventoryPage.addItemToCart("Sauce Labs Bike Light");
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(
      "2",
    );
  });

  test("completes an order and shows confirmation", async ({
    page,
    pomManager,
  }) => {
    await pomManager.inventoryPage.addItemToCart("Sauce Labs Backpack");
    await pomManager.inventoryPage.goToCart();
    await pomManager.cartCheckoutPage.startCheckout();
    await pomManager.cartCheckoutPage.completeCustomerInformation(
      "Roshik",
      "Maharjan",
      "44600",
    );

    await expect(page).toHaveURL(/checkout-step-two.html/);
    await expect(page.locator('[data-test="total-label"]')).toBeVisible();
    await pomManager.cartCheckoutPage.finishCheckout();

    await expect(page.getByText("Thank you for your order!")).toBeVisible();
  });
});
