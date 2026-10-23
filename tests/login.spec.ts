import { expect, test } from "../fixtures/fixtures.ts";
import { users } from "./data/users.ts";

test.describe("Login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const user of users) {
    test(`logs in as ${user.username}`, async ({ page, loginPage }) => {
      await loginPage.login(user.username, user.password);

      if (user.expected.type === "inventory") {
        await expect(page).toHaveURL("/inventory.html");
      } else {
        await expect(
          page.getByText(user.expected.message, { exact: true }),
        ).toBeVisible();
      }
    });
  }
});

