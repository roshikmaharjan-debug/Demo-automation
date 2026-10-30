import { expect, test } from "./fixtures/fixtures";
import { DbConnection } from "./db/dbConnection";
import { DbManager } from "./db/dbManager";
import LoginPage from "./pages/login.page";

const users = (() => {
  const db = new DbManager();
  try {
    return db.userRepository.getAll();
  } finally {
    DbConnection.close();
  }
})();

test.describe("Login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const user of users) {
    const isError = user.expected_type === "error";
    test(`logs in as ${user.username}${isError ? " (error)" : ""}`, async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(user.username, user.password);

      if (!isError) {
        await expect(page).toHaveURL("/inventory.html");
      } else {
        if (!user.expected_message) {
          throw new Error(
            `The expected error message for ${user.username} is missing.`,
          );
        }
        await expect(
          page.getByText(user.expected_message, { exact: true }),
        ).toBeVisible();
      }
    });
  }
});
