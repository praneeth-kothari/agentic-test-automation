import { test, expect } from "@playwright/test";

const BASE_URL = "https://reqres.in/api";

test.describe("API — Users", () => {
  test("GET /users/2 — returns 200 with user data", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users/2`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveProperty("id", 2);
    expect(body.data).toHaveProperty("email");
  });

  test("GET /users?page=2 — returns paginated list", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users?page=2`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.page).toBe(2);
    expect(body.data).toBeInstanceOf(Array);
  });

  test("GET /users/999 — returns 404", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users/999`);
    expect(response.status()).toBe(404);
  });

  test("POST /users — creates user with 201", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/users`, {
      data: { name: "Praneeth", job: "QA Architect" },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.name).toBe("Praneeth");
    expect(body).toHaveProperty("createdAt");
  });

  test("PUT /users/2 — updates user with 200", async ({ request }) => {
    const response = await request.put(`${BASE_URL}/users/2`, {
      data: { name: "Updated", job: "Senior QA" },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe("Updated");
  });

  test("DELETE /users/2 — returns 204", async ({ request }) => {
    const response = await request.delete(`${BASE_URL}/users/2`);
    expect(response.status()).toBe(204);
  });
});

test.describe("API — Authentication", () => {
  test("POST /login — returns token on success", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: { email: "eve.holt@reqres.in", password: "cityslicka" },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toBeTruthy();
  });

  test("POST /login — 400 on missing password", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: { email: "eve.holt@reqres.in" },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe("Missing password");
  });

  test("GET /users/2 — responds within 2000ms", async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${BASE_URL}/users/2`);
    expect(response.status()).toBe(200);
    expect(Date.now() - start).toBeLessThan(2000);
  });

  test("GET /users/2 — Content-Type is application/json", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users/2`);
    expect(response.headers()["content-type"]).toContain("application/json");
  });
});
