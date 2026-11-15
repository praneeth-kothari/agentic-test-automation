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

<<<<<<< HEAD
export { expect } from "@playwright/test";
=======
export { expect } from "@playwright/test";
>>>>>>> 0546daedbc27954087e2c5e960ab030cab5db21b
