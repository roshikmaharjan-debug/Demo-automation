import { expect, test } from "@playwright/test";
import CartCheckoutPage from "../pages/cart-checkout.page";
import InventoryPage from "../pages/inventory.page";
import LoginPage from "../pages/login.page";

test.describe("Cart and checkout", () => {
  let inventoryPage: InventoryPage;
  let cartCheckoutPage: CartCheckoutPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartCheckoutPage = new CartCheckoutPage(page);
    await loginPage.goto();
    await loginPage.login("standard_user", "secret_sauce");
  });

  test("adds two items to the cart", async ({ page }) => {
    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await inventoryPage.addItemToCart("Sauce Labs Bike Light");
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText("2");
  });

  test("completes an order and shows confirmation", async ({ page }) => {
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
