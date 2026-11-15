import { Page, Locator, expect } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryList = page.locator('[data-test="inventory-list"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.pageTitle = page.locator('[data-test="title"]');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/.*inventory/);
    await expect(this.pageTitle).toContainText("Products");
  }

  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  async sortBy(option: string) {
    await this.sortDropdown.selectOption(option);
  }

  async getFirstItemName(): Promise<string> {
    return (await this.inventoryItems.first().locator(".inventory_item_name").textContent()) || "";
  }
}