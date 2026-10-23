import { expect, test } from "../fixtures/fixtures.ts";
import InventoryPage from "../pages/inventory.page";

test.use({ storageState: { cookies: [], origins: [] } });

test("performance_glitch_user adds the Backpack to the cart", async ({
  page,
  loginPage,
}) => {
  await loginPage.login("performance_glitch_user", "secret_sauce");
  const inventoryPage = new InventoryPage(page);
  await inventoryPage.addItemToCart("Sauce Labs Backpack");
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(
    "1",
  );
});
