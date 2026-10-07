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
    await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");
  });

  test("Login with wrong password", async ({ page }) => {
    await demo.LoginPage("standard_user", "asd");
    await expect(
      page.getByText("Username and password do not match"),
    ).toBeVisible();
  });

  test("Login with locked out user", async ({ page }) => {
    await demo.LoginPage("locked_out_user", "secret_sauce");
    await expect(page.getByText("locked out")).toBeVisible();
  });

  test("Add two items to cart and check it displays 2", async ({ page }) => {
    await demo.LoginPage("standard_user", "secret_sauce");
    await demo.addItemToCart("Sauce Labs Backpack");
    await demo.addItemToCart("Sauce Labs Bike Light");
    await expect(page.locator(".shopping_cart_badge")).toHaveText("2");
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

  test("completes order and shows confirmation", async ({ page }) => {
    await demo.LoginPage("standard_user", "secret_sauce");
    await demo.addItemToCart("Sauce Labs Backpack");
    await demo.goToCheckout();
    await demo.completeCheckout("Roshik", "Maharjan", "44600");

    await expect(page).toHaveURL(/checkout-step-two.html/);
    await expect(page.locator(".summary_total_label")).toBeVisible();
    await demo.finishCheckout();

    await expect(page.getByText("Thank you for your order!")).toBeVisible();
  });

  test("Check out inventory and go back", async ({ page }) => {
    await demo.LoginPage("standard_user", "secret_sauce");
    await demo.checkOutInventory("Sauce Labs Backpack");
    await expect(
      page.getByText("carry.allTheThings() with the sleek"),
    ).toBeVisible();
    await demo.backToProducts();
  });
  test("Check Logout", async ({ page }) => {
    await demo.LoginPage("standard_user", "secret_sauce");  
    await demo.Logout();
    await expect(page).toHaveURL("https://www.saucedemo.com/");
  });

  test("Spinner Test",async({page})=>{
    await demo.LoginPage("standard_user", "secret_sauce");
   
    await demo.Spinner();
    await expect(page.getByText("Test.allTheThings() T-Shirt (Red)")).toBeVisible();
  });

  test.only("About section",async({page})=>{
    await demo.LoginPage("standard_user", "secret_sauce");
    await demo.AboutSection();
    await expect(page).toHaveTitle("Sauce Labs: AI-Unified Release Assurance Platform");

  })

 
});
