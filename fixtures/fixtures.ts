import { test as base, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";

interface PageFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
}

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }: { page: Page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }: { page: Page }, use) => {
    await use(new InventoryPage(page));
  },
});

export { expect } from "@playwright/test";
