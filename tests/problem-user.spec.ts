import { expect, test } from "../fixtures/fixtures.ts";
import CartCheckoutPage from "../pages/cart-checkout.page";
import InventoryPage from "../pages/inventory.page";

test.describe("Problem user", () => {
  // Bug: problem_user sees a broken/dog image for the Backpack instead of the product image.
  test("shows the correct Backpack image", async ({ page, loginPage }) => {
    await loginPage.login("problem_user", "secret_sauce");
    await expect(page).toHaveURL("/inventory.html");
    await expect(
      page.getByRole("img", { name: "Sauce Labs Backpack" }),
    ).toHaveAttribute("src", /backpack/i);
  });

  test("adds the Backpack to the cart", async ({ page, loginPage }) => {
    await loginPage.login("problem_user", "secret_sauce");
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(
      "1",
    );

    await inventoryPage.goToCart();
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(
      "Sauce Labs Backpack",
    );
  });

  // Bug: entering the last name overwrites the first-name field; checkout should retain both values.
  test("completes checkout", async ({ page, loginPage }) => {
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