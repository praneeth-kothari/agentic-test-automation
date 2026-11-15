import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : 2,
  reporter: [
    ["html", { open: "never" }],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["allure-playwright"],
  ],
  use: {
    baseURL: "https://www.saucedemo.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
  ],
});