# Playwright Fixtures

This guide explains how to use Playwright fixtures with this project’s page
objects. A fixture can provide a test with a page object, perform setup such as
logging in, or both.

> **Current project status:** The project has page objects under `pages/`, but
> does not currently have a custom fixture module. The code below is a complete
> example you can add as `tests/fixtures.ts`. Tests only use these fixtures
> after they import `test` from that module.

## What a fixture does

Playwright already provides built-in fixtures such as `page`, `context`, and
`browser`. A test asks for a fixture by listing it in its callback:

```ts
import { expect, test } from "@playwright/test";

test("opens the login page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByPlaceholder("Username")).toBeVisible();
});
```

Playwright creates the `page` fixture for the test and cleans it up afterward.
Custom fixtures work the same way: a test receives the fixture it requests, and
Playwright handles its setup and teardown.

## Add a fixture module

Create `tests/fixtures.ts` with the following complete implementation:

```ts
import { test as base, type Page } from "@playwright/test";
import CartCheckoutPage from "../pages/cart-checkout.page";
import InventoryPage from "../pages/inventory.page";
import LoginPage from "../pages/login.page";
import SideMenuPage from "../pages/side-menu.page";

type AppFixtures = {
  loginPage: LoginPage;
  loggedInPage: Page;
  inventoryPage: InventoryPage;
  cartCheckoutPage: CartCheckoutPage;
  sideMenuPage: SideMenuPage;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("standard_user", "secret_sauce");
    await use(page);
  },

  inventoryPage: async ({ loggedInPage }, use) => {
    await use(new InventoryPage(loggedInPage));
  },

  cartCheckoutPage: async ({ loggedInPage }, use) => {
    await use(new CartCheckoutPage(loggedInPage));
  },

  sideMenuPage: async ({ loggedInPage }, use) => {
    await use(new SideMenuPage(loggedInPage));
  },
});

export { expect } from "@playwright/test";
```

Each fixture follows the same pattern:

1. Playwright creates the built-in `page` fixture.
2. The custom fixture creates or configures what the test requested.
3. `await use(value)` makes that value available to the test.
4. When the test finishes, Playwright tears down the fixture and its
   dependencies.

The `loggedInPage` fixture performs login. The page-object fixtures depend on
it, so requesting `inventoryPage`, `cartCheckoutPage`, or `sideMenuPage`
automatically opens the site and logs in first. Requesting only `loginPage` does
not perform login; this keeps it useful for testing successful and failed login
scenarios.

## Use fixtures in tests

After adding `tests/fixtures.ts`, import `test` and `expect` from it instead of
directly from `@playwright/test`.

### Login test

This complete example uses the `loginPage` fixture without automatic login:

```ts
import { expect, test } from "./fixtures";

test("logs in successfully", async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.login("standard_user", "secret_sauce");

  await expect(page).toHaveURL(
    "https://www.saucedemo.com/inventory.html",
  );
});
```

Login error tests can use the same fixture and pass invalid credentials:

```ts
import { expect, test } from "./fixtures";

test("shows an error for an incorrect password", async ({
  loginPage,
  page,
}) => {
  await loginPage.goto();
  await loginPage.login("standard_user", "incorrect-password");

  await expect(
    page.getByText("Username and password do not match"),
  ).toBeVisible();
});
```

### Inventory test

This test requests `inventoryPage`. That fixture depends on `loggedInPage`, so
login happens before the test starts:

```ts
import { expect, test } from "./fixtures";

test("sorts inventory prices from low to high", async ({
  inventoryPage,
  page,
}) => {
  await expect(inventoryPage.itemsLocator).toHaveCount(6);

  const prices = await inventoryPage.sortPricesLowToHigh();
  expect(prices).toHaveLength(await inventoryPage.itemsLocator.count());
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});
```

### Cart and checkout test

The inventory and checkout page objects use the same Playwright page. Both
fixtures depend on the same `loggedInPage` fixture instance in this test:

```ts
import { expect, test } from "./fixtures";

test("completes an order", async ({
  inventoryPage,
  cartCheckoutPage,
  page,
}) => {
  await inventoryPage.addItemToCart("Sauce Labs Backpack");
  await inventoryPage.goToCart();
  await cartCheckoutPage.startCheckout();
  await cartCheckoutPage.completeCustomerInformation(
    "Roshik",
    "Maharjan",
    "44600",
  );

  await expect(page).toHaveURL(/checkout-step-two\.html/);
  await cartCheckoutPage.finishCheckout();
  await expect(page.getByText("Thank you for your order!")).toBeVisible();
});
```

### Navigation test

The side-menu fixture also logs in before providing its page object:

```ts
import { expect, test } from "./fixtures";

test("logs out", async ({ sideMenuPage, page }) => {
  await sideMenuPage.logout();
  await expect(page).toHaveURL("https://www.saucedemo.com/");
});
```

## Fixture dependency flow

When a test requests `inventoryPage`, Playwright resolves its dependency first:

```text
test requests inventoryPage
        |
        v
inventoryPage requests loggedInPage
        |
        v
loggedInPage opens Sauce Demo and logs in
        |
        v
inventoryPage is created with that same page
        |
        v
test starts
```

Fixtures are lazy: Playwright only sets up fixtures requested by the test
(including their dependencies). A login-only test that requests `loginPage`
does not also run the `loggedInPage` setup.

## Run tests

Run the full suite:

```bash
npm test
```

Run one spec file:

```bash
npx playwright test tests/inventory.spec.ts
```

Run tests with the interactive UI:

```bash
npx playwright test --ui
```

## When to use a fixture

Use a fixture when several tests need the same setup or resource—for example,
an authenticated page or a page object. Keep scenario-specific actions in the
test itself. Login-error tests should use `loginPage`, not `loggedInPage`,
because those tests need to control the credentials and observe the login
result.

The example uses Sauce Demo's public test credentials. If you later move
credentials to environment variables, keep secrets out of source control and
provide them through your local environment or CI secret store.
