import { Locator, Page } from "@playwright/test";

class InventoryPage {
  page: Page;
  items: Locator;
  filter: Locator;
  prices: Locator;
  cart: Locator;
  backToProductsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.items = page.locator(".inventory_item");
    this.filter = page.locator(".product_sort_container");
    this.prices = page.locator(".inventory_item_price");
    this.cart = page.locator(".shopping_cart_link");
    this.backToProductsButton = page.getByRole("button", {
      name: "Back to products",
    });
  }

  get itemsLocator() {
    return this.items;
  }

  async addItemToCart(itemName: string) {
    await this.items
      .filter({ hasText: itemName })
      .getByRole("button", { name: "Add to cart" })
      .click();
  }

  async sortPricesLowToHigh(): Promise<number[]> {
    await this.filter.selectOption("lohi");
    const prices = await this.prices.allTextContents();
    return prices.map((price) => parseFloat(price.replace("$", "")));
  }

  async openItem(itemName: string) {
    await this.page.getByText(itemName).click();
  }

  async backToProducts() {
    await this.backToProductsButton.click();
  }

  async goToCart() {
    await this.cart.click();
  }
}

export default InventoryPage;
