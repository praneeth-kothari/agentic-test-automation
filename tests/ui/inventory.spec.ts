import { test, expect } from "../../fixtures/fixtures";

test.describe("Login Page", () => {
  test("TC-001: Successful login", async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login("standard_user", "secret_sauce");
    await inventoryPage.expectLoaded();
  });

  test("TC-002: Login with invalid credentials", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("invalid_user", "wrong_password");
    await loginPage.expectError("do not match");
  });

  test("TC-003: Login with empty fields", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitEmpty();
    await loginPage.expectError("Username is required");
  });

  test("TC-004: Login with locked-out user", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("locked_out_user", "secret_sauce");
    await loginPage.expectError("locked out");
  });
});

test.describe("Inventory Page", () => {
  test("TC-010: Browse inventory items", async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login("standard_user", "secret_sauce");
    await inventoryPage.expectLoaded();

    await inventoryPage.sortBy("az");
    const firstName = await inventoryPage.getFirstItemName();
    expect(firstName).toContain("Backpack");
  });
});
