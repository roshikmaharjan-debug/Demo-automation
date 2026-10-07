import { expect, test } from "@playwright/test";
import InventoryPage from "../pages/inventory.page";
import LoginPage from "../pages/login.page";


test.describe("Inventory", () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login("standard_user", "secret_sauce");
  });

  test("displays six items sorted by price from low to high", async ({
    page,
  }) => {
    const items = inventoryPage.itemsLocator;
    await expect(items).toHaveCount(6);

    const prices = await inventoryPage.sortPricesLowToHigh();
    expect(prices).toHaveLength(await items.count());
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test("opens an item and returns to the inventory", async ({ page }) => {
    await inventoryPage.openItem("Sauce Labs Backpack");
    await expect(
      page.getByText("carry.allTheThings() with the sleek"),
    ).toBeVisible();
    await inventoryPage.backToProducts();
    await expect(page.locator(".inventory_list")).toBeVisible();
  });
});
