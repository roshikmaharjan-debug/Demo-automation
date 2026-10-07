import { Locator, Page } from "@playwright/test";

class SauceDemo {
  page: Page;
  username: Locator;
  password: Locator;
  loginButton: Locator;
  addToCart: Locator;

  filter: Locator;
  price: Locator;
  cart: Locator;
  checkout: Locator;
  firstName: Locator;
  lastName: Locator;
  zip: Locator;
  continueBtn: Locator;
  finish: Locator;
  back:Locator;
  menuBtn:Locator;
  logoutBtn:Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByPlaceholder("Username");
    this.password = page.getByPlaceholder("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.addToCart = page.locator(".inventory_item");

    this.filter = page.locator(".product_sort_container");
    this.price = page.locator(".inventory_item_price");
    this.cart = page.locator(".shopping_cart_link");
    this.checkout = page.getByRole("button", { name: "Checkout" });
    this.firstName = page.getByPlaceholder("First Name");
    this.lastName = page.getByPlaceholder("Last Name");
    this.zip = page.getByPlaceholder("Zip/Postal Code");
    this.continueBtn = page.getByRole("button", { name: "Continue" });
    this.finish = page.getByRole("button", { name: "Finish" });
    this.back = page.getByRole("button", { name: "Back to products" });
    this.menuBtn = page.getByRole("button",{name:"Open Menu"});
    this.logoutBtn = page.getByRole("button",{name:"Logout"});
  }

  async gotoLoginPage() {
    await this.page.goto("/");
  }

  async LoginPage(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async addItemToCart(cartItem: string) {
    await this.addToCart
      .filter({ hasText: cartItem })
      .getByRole("button", { name: "Add to cart" })
      .click();
  }

  async filterByPriceLowToHigh(): Promise<number[]> {
    await this.filter.selectOption("lohi");
    const prices = await this.price.allTextContents();

    const nums = prices.map((p) => parseFloat(p.replace("$", ""))); //parseFloat to convert string to number
    return nums;
  }

  async goToCheckout() {
    await this.cart.click();

    await this.checkout.click();
  }

  async completeCheckout(first: string, last: string, post: string) {
    await this.firstName.fill(first);
    await this.lastName.fill(last);
    await this.zip.fill(post);
    await this.continueBtn.click();
  }

  async finishCheckout() {
    await this.finish.click();
  }
  async checkOutInventory(product:string) {
    await this.page.getByText(product).click();
  }

  async backToProducts(){
    await this.back.click();
  }

  async Logout(){
    await this.menuBtn.click();
    await this.logoutBtn.click();
  }
}


export default SauceDemo;
