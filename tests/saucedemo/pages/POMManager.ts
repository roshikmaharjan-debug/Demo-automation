import type { Page } from "@playwright/test";
import CartCheckoutPage from "./cart-checkout.page";
import InventoryPage from "./inventory.page";
import LoginPage from "./login.page";
import SideMenuPage from "./side-menu.page";

export class POMManager {
  public readonly loginPage: LoginPage;
  public readonly inventoryPage: InventoryPage;
  public readonly cartCheckoutPage: CartCheckoutPage;
  public readonly sideMenuPage: SideMenuPage;

  constructor(page: Page) {
    this.loginPage = new LoginPage(page);
    this.inventoryPage = new InventoryPage(page);
    this.cartCheckoutPage = new CartCheckoutPage(page);
    this.sideMenuPage = new SideMenuPage(page);
  }
}
