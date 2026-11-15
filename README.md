# Agentic Test Automation

[![Test Suite](https://github.com/praneeth-kothari/agentic-test-automation/actions/workflows/test-suite.yml/badge.svg)](https://github.com/praneeth-kothari/agentic-test-automation/actions/workflows/test-suite.yml)

**Three core agents that plan, generate, and self-heal Playwright test suites using POM.**

| Agent | Persona | Input | Output |
|-------|---------|-------|--------|
| Planner | Aria (QA Strategist) | URL + seed | specs/*.md |
| Generator | Bolt (Automation Engineer) | specs/*.md | pages/*.ts + tests/*.spec.ts |
| Healer | Patch (Self-Healing Specialist) | Failing results | Patched pages/ + tests/ |

## POM Structure

```
├── pages/                     # Page Object Model
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   └── index.ts
├── fixtures/                  # Playwright fixtures
│   └── fixtures.ts            # Injects page objects into tests
├── agents/                    # The three core agents
│   ├── planner.ts
│   ├── generator.ts
│   ├── healer.ts
│   └── index.ts
├── specs/                     # Generated test plans
├── tests/
│   ├── ui/                    # UI tests using POM fixtures
│   └── api/                   # API tests (REST, auth, headers)
├── playwright.config.ts
├── run.ts                     # Pipeline orchestrator
└── README.md
```

## Quickstart

```bash
npm install
npx playwright install chromium
npx tsx run.ts "https://www.saucedemo.com" "login and browse inventory"
```

## Run individually

```bash
npx tsx agents/planner.ts --url "https://www.saucedemo.com" --seed "login"
npx tsx agents/generator.ts --specs specs/ --output tests/
npx playwright test
npx tsx agents/healer.ts --tests tests/
```

## POM Pattern

```typescript
// fixtures/fixtures.ts
export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

// tests/ui/inventory.spec.ts
import { test, expect } from "../../fixtures/fixtures";
test("TC-001", async ({ loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.login("standard_user", "secret_sauce");
  await inventoryPage.expectLoaded();
});
```

## API Testing

10 API tests against ReqRes.in covering CRUD, auth, headers, and response time.

## CI/CD

GitHub Actions pipeline **Test Suite**: typecheck → UI tests (Chromium, POM fixtures against saucedemo.com) → API tests (ReqRes.in) → cross-browser matrix (Chromium + Firefox).

## License

MIT
