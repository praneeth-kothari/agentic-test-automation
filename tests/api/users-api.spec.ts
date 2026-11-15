import { test, expect } from "@playwright/test";

const BASE_URL = "https://reqres.in/api";

test.describe("API — Users", () => {
  test("GET /users/2 returns 200", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users/2`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveProperty("id", 2);
  });

  test("POST /users creates user", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/users`, {
      data: { name: "Praneeth", job: "QA Architect" },
    });
    expect(response.status()).toBe(201);
    expect((await response.json()).name).toBe("Praneeth");
  });

  test("DELETE /users/2 returns 204", async ({ request }) => {
    const response = await request.delete(`${BASE_URL}/users/2`);
    expect(response.status()).toBe(204);
  });
});

test.describe("API — Auth", () => {
  test("POST /login returns token", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: { email: "eve.holt@reqres.in", password: "cityslicka" },
    });
    expect(response.status()).toBe(200);
    expect((await response.json()).token).toBeTruthy();
  });

  test("POST /login 400 on missing password", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: { email: "eve.holt@reqres.in" },
    });
    expect(response.status()).toBe(400);
  });
});
