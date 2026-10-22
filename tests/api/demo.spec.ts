import { test, expect } from "../../fixtures/fixtures.ts";

test("get api test", async ({ page }) => {
  const response = await page.request.get(
    "https://jsonplaceholder.typicode.com/users/1",
  );
  expect(response.status()).toBe(200);
  const data = await response.json();

  expect(data.id).toBe(1);
  expect(data.name).toBe("Leanne Graham");
});

test("post api test", async ({ page }) => {
  const response = await page.request.post(
    "https://jsonplaceholder.typicode.com/posts",
    {
      data: {
        name: "Roshik",
        username: "Roshik Maharjan",
        email: "test@gmail.com",
      },
    },
  );

  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.name).toBe("Roshik");
  expect(data.username).toBe("Roshik Maharjan");
  expect(data.email).toBe("test@gmail.com");
});

test("PUT api test", async ({ request }) => {
  const response = await request.put(
    "https://jsonplaceholder.typicode.com/users/1",
    {
      data: {
        name: "Roshik",
        username: "updated roshik",
        email: "rosupdated@gmail.com",
      },
    },
  );

  expect(response.status()).toBe(200);

  const user = await response.json();

  expect(user.id).toBe(1);
  expect(user.name).toBe("Roshik");
  expect(user.username).toBe("updated roshik");
  expect(user.email).toBe("rosupdated@gmail.com");
});

test("delete api test", async ({ request }) => {
  const response = await request.delete(
    "https://jsonplaceholder.typicode.com/users/1",
  );

  expect(response.status()).toBe(200);
});
