
import { expect, test } from "../fixtures/fixtures.ts";

test.describe("Inventory", () => {


  test("displays six items sorted by price from low to high", async ({
    page,inventoryPage
  }) => {
    const items = inventoryPage.itemsLocator;
    await expect(items).toHaveCount(6);

    const prices = await inventoryPage.sortPricesLowToHigh();
    expect(prices).toHaveLength(await items.count());
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test("opens an item and returns to the inventory", async ({ page,inventoryPage }) => {
    await inventoryPage.openItem("Sauce Labs Backpack");
    await expect(page.locator('[data-test="inventory-item"]')).toBeVisible();
    await inventoryPage.backToProducts();
    await expect(page.locator('[data-test="inventory-list"]')).toBeVisible();
  });
});
