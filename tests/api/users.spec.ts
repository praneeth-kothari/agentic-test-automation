/**
 * API Tests — ReqRes.in practice API
 * Covers: CRUD operations, authentication, response validation
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "https://reqres.in/api";

// --- GET requests ---

test("GET /users/2 — returns 200 with user data", async ({ request }) => {
  const response = await request.get(`${BASE_URL}/users/2`);
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.data).toHaveProperty("id", 2);
  expect(body.data).toHaveProperty("email");
  expect(body.data).toHaveProperty("first_name");
  expect(body.data).toHaveProperty("last_name");
  expect(body.data).toHaveProperty("avatar");
});

test("GET /users?page=2 — returns paginated list", async ({ request }) => {
  const response = await request.get(`${BASE_URL}/users?page=2`);
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toHaveProperty("page", 2);
  expect(body).toHaveProperty("per_page");
  expect(body).toHaveProperty("total");
  expect(body.data).toBeInstanceOf(Array);
  expect(body.data.length).toBeGreaterThan(0);
});

test("GET /users/999 — returns 404 for non-existent user", async ({ request }) => {
  const response = await request.get(`${BASE_URL}/users/999`);
  expect(response.status()).toBe(404);
});

// --- POST requests ---

test("POST /users — creates user with 201", async ({ request }) => {
  const response = await request.post(`${BASE_URL}/users`, {
    data: { name: "Praneeth", job: "QA Architect" },
  });
  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body).toHaveProperty("id");
  expect(body).toHaveProperty("createdAt");
  expect(body.name).toBe("Praneeth");
  expect(body.job).toBe("QA Architect");
});

// --- PUT requests ---

test("PUT /users/2 — updates user with 200", async ({ request }) => {
  const response = await request.put(`${BASE_URL}/users/2`, {
    data: { name: "Praneeth Updated", job: "Senior QA Architect" },
  });
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.name).toBe("Praneeth Updated");
  expect(body).toHaveProperty("updatedAt");
});

// --- DELETE requests ---

test("DELETE /users/2 — returns 204", async ({ request }) => {
  const response = await request.delete(`${BASE_URL}/users/2`);
  expect(response.status()).toBe(204);
});

// --- Authentication patterns ---

test("POST /login — returns Bearer token on success", async ({ request }) => {
  const response = await request.post(`${BASE_URL}/login`, {
    data: { email: "eve.holt@reqres.in", password: "cityslicka" },
  });
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toHaveProperty("token");
  expect(body.token).toBeTruthy();
});

test("POST /login — returns 400 on missing password", async ({ request }) => {
  const response = await request.post(`${BASE_URL}/login`, {
    data: { email: "eve.holt@reqres.in" },
  });
  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body).toHaveProperty("error", "Missing password");
});

test("POST /register — returns 200 with token and id", async ({ request }) => {
  const response = await request.post(`${BASE_URL}/register`, {
    data: { email: "eve.holt@reqres.in", password: "pistol" },
  });
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toHaveProperty("id");
  expect(body).toHaveProperty("token");
});

// --- Response time validation ---

test("GET /users/2 — responds within 2000ms", async ({ request }) => {
  const startTime = Date.now();
  const response = await request.get(`${BASE_URL}/users/2`);
  const elapsed = Date.now() - startTime;

  expect(response.status()).toBe(200);
  expect(elapsed).toBeLessThan(2000);
});

// --- Response headers validation ---

test("GET /users/2 — returns correct Content-Type", async ({ request }) => {
  const response = await request.get(`${BASE_URL}/users/2`);
  const contentType = response.headers()["content-type"];
  expect(contentType).toContain("application/json");
});