# Agentic Test Automation

[![Test Suite](https://github.com/praneeth-kothari/agentic-test-automation/actions/workflows/test-suite.yml/badge.svg)](https://github.com/praneeth-kothari/agentic-test-automation/actions/workflows/test-suite.yml)
[![Healenium Demo](https://github.com/praneeth-kothari/agentic-test-automation/actions/workflows/healenium.yml/badge.svg)](https://github.com/praneeth-kothari/agentic-test-automation/actions/workflows/healenium.yml)

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
├── healenium/                 # Java/Selenium self-healing module (Healenium)
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

## Healenium Self-Healing (Java/Selenium module)

Healenium works with **Selenium (Java) only** — there is no Playwright port.
So this repo demonstrates self-healing in **both ecosystems**:

| Layer | Implementation | Where |
|---|---|---|
| Selenium/Java | Healenium library + hlm-backend + postgres | [`healenium/`](healenium/) |
| Playwright/TypeScript | Custom Healer agent (`Patch`) | `agents/healer.ts` |

The demo runs two ordered phases against saucedemo.com:
1. **Phase 1** — healthy locators log in; Healenium records element info in its backing store
2. **Phase 2** — deliberately broken locators (`#user-name-wrong` etc.) are **healed at runtime** by scoring stored element info against the live DOM — login still succeeds

```bash
docker compose -f healenium/docker-compose.yml up -d
cd healenium && mvn clean test
```

CI: the `Healenium Demo` workflow starts the docker stack, runs `mvn test`,
dumps backend logs, and uploads healing reports as artifacts.

## CI/CD

Two GitHub Actions pipelines:

| Workflow | Jobs |
|---|---|
| **Test Suite** | typecheck → UI tests (Chromium) → API tests → cross-browser matrix (Chromium + Firefox) |
| **Healenium Demo** | docker compose backend → Java/Maven self-healing test → healing report artifacts |

## License

MIT
