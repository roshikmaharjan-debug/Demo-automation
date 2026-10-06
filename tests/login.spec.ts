import { expect, test } from "@playwright/test";
import Login from "../pages/login.page";

test("Login", async ({ page }) => {
  const login = new Login(page);
  await login.gotoLoginPage();
  await login.Login("standard_user", "secret_sauce");
  await expect(page.locator("div.app_logo")).toBeVisible();
});

test("Login with wrong password", async ({ page }) => {
  const login = new Login(page);
  await login.gotoLoginPage();
  await login.Login("standard_user", "wrong_password");
  await expect(page.locator(".error-message-container ")).toContainText(
    "Username and password do not match",
  );
});

test("Login with locked out user", async ({ page }) => {
  const login = new Login(page);
  await login.gotoLoginPage();
  await login.Login("locked_out_user", "secret_sauce");
  await expect(page.locator(".error-message-container ")).toContainText(
    "locked out",
  );
});

test("Add two items to cart and check it displays 2", async ({ page }) => {
  const login = new Login(page);
  await login.gotoLoginPage();
  await login.Login("standard_user", "secret_sauce");
  await login.addItemToCart("Sauce Labs Backpack");
  await login.addItemToCart("Sauce Labs Bike Light");
   await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
});

 test.only('displays 6 items and sorts by price low to high', async ({ page }) => {
     const login = new Login(page);
  await login.gotoLoginPage();
  await login.Login("standard_user", "secret_sauce");
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);

    await page.locator('.product_sort_container').selectOption('lohi');
    const prices = await page.locator('.inventory_item_price').allTextContents();
    console.log(prices);
    const nums = prices.map(p => parseFloat(p.replace('$', ''))); //parseFloat to convert string to number
    
    expect(nums).toEqual(nums.toSorted((a, b) => a - b)); 
  });
