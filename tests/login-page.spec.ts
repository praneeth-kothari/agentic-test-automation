import { test, expect } from "@playwright/test";

describe("login-page", () => {
  test("TC-001: Successful login", async ({ page }) => {
    // Step 1: Enter standard_user in user-name field
    // Step 2: Enter valid password in password field
    // Step 3: Click the submit button

    await page.goto("/");
    await page.fill('[data-test="user-name"]', "standard_user");
    await page.fill('[data-test="password"]', "secret_sauce");
    await page.click('[data-test="login-button"]');

    // Expected: User is redirected to the inventory page
    await expect(page).toHaveURL(/.*inventory/);
  });

  test("TC-002: Login with invalid credentials", async ({ page }) => {
    await page.goto("/");
    await page.fill('[data-test="user-name"]', "invalid_user");
    await page.fill('[data-test="password"]', "wrong_password");
    await page.click('[data-test="login-button"]');

    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });

  test("TC-003: Login with empty fields", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-test="login-button"]');

    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });
});