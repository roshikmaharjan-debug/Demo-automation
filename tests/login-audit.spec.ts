import { expect, test } from "../fixtures/fixtures";

test.describe("Login audit persistence tests", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ db }) => {
    db.userRepository.clearLoginResults();
  });



  test("persists and reads a login audit record", async ({
    page,
    loginPage,
    db,
  }) => {
    const user = db.userRepository.findByUsername("standard_user");
    if (!user) {
      throw new Error(
        "The standard_user test account is missing from the database.",
      );
    }

    await loginPage.login(user.username, user.password);
    await expect(page).toHaveURL(/.*inventory.html/);

    const executedAt = new Date().toISOString();
    db.userRepository.insertLoginResult(user.username, "SUCCESS", executedAt);

    const records = db.userRepository.findLoginResultsByUsername(user.username);
    expect(records).toHaveLength(1);
    expect(records[0].outcome).toBe("SUCCESS");

   
    const nonExistent = db.userRepository.findLoginResultsByUsername(
      "ghost_user_never_exists",
    );
    expect(nonExistent).toHaveLength(0);
  });
});
