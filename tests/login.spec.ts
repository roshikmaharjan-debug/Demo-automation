import { expect, test } from "@playwright/test";
import SauceDemo from "../pages/sauceDemo.page";


test.describe("Login Tests", () => {
  let demo: SauceDemo;
  test.beforeEach(async ({ page }) => {
    demo = new SauceDemo(page);
    await demo.gotoLoginPage();

  });


  test("Login", async ({ page }) => {
    await demo.LoginPage("standard_user", "secret_sauce");
    await expect(page.getByText("Swag Labs")).toBeVisible();
  });

  test("Login with wrong password", async ({ page }) => {
    await demo.LoginPage("standard_user", "asd");
    await expect(page.getByText("Username and password do not match")).toContainText(
      "Username and password do not match",
    );
  });

  test("Login with locked out user", async ({ page }) => {
    await demo.LoginPage("locked_out_user", "secret_sauce");
    await expect(page.getByText("locked out")).toContainText(
      "Sorry, this user has been locked out.",
    );
  });

  test("Add two items to cart and check it displays 2", async ({ page }) => {
    await demo.LoginPage("standard_user", "secret_sauce");
    await demo.addItemToCart("Sauce Labs Backpack");
    await demo.addItemToCart("Sauce Labs Bike Light");
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  });


   test("displays 6 items and sorts by price low to high", async ({ page }) => {
    await demo.LoginPage("standard_user", "secret_sauce");
    const items = page.locator(".inventory_item");
    await expect(items).toHaveCount(6);

    const nums = await demo.filterByPriceLowToHigh();
    const sortedNums = [...nums].sort((a, b) => a - b);

    expect(nums).toHaveLength(await items.count());
    expect(nums).toEqual(sortedNums);
  });

  test('completes order and shows confirmation', async ({ page }) => {
    await demo.LoginPage("standard_user", "secret_sauce");
    await demo.addItemToCart("Sauce Labs Backpack");
    await demo.goToCheckout();
    await demo.completeCheckout("Roshik", "Maharjan", "44600");

    await expect(page).toHaveURL(/checkout-step-two.html/);
    await expect(page.locator('.summary_total_label')).toBeVisible();
    await demo.finishCheckout();

    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });
});