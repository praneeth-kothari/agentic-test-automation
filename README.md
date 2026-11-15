# Agentic Test Automation

**Three core agents that plan, generate, and self-heal Playwright test suites.**

Inspired by the BMAD methodology — each agent has a persona, a defined skill, and a structured output contract.

## The Three Core Agents

| Agent | Persona | Input | Output | What it does |
|-------|---------|-------|--------|-------------|
| **Planner** | Aria (QA Strategist) | URL + seed action | `specs/*.md` | Explores the application, discovers interactive elements, and writes structured Markdown test plans |
| **Generator** | Bolt (Automation Engineer) | `specs/*.md` | `tests/*.spec.ts` | Converts Markdown plans into executable, reliable Playwright TypeScript scripts |
| **Healer** | Patch (Self-Healing Specialist) | Failing test results | Patched `tests/*.spec.ts` | Replays failing tests, inspects UI changes and logs, patches broken locators or logic until tests pass |

## How it works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PLANNER    │     │  GENERATOR   │     │    HEALER    │
│  (Aria)      │     │  (Bolt)      │     │  (Patch)     │
│              │     │              │     │              │
│ Explores app │────▶│ Reads specs  │────▶│ Runs tests   │
│ Discovers    │     │ Generates    │     │ Detects      │
│ elements     │     │ Playwright   │     │ failures     │
│ Writes       │     │ TypeScript   │     │ Patches      │
│ test plans   │     │ test files   │     │ locators     │
│ in specs/    │     │ in tests/    │     │ Re-runs      │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Quickstart

```bash
pip install -r requirements.txt
npm install
npx playwright install chromium
bash run.sh "https://www.saucedemo.com" "login and browse inventory"
```

## Healenium self-healing demo

See [`healenium/README.md`](healenium/README.md) for a Java/Selenium demo
of Healenium locator self-repair.

## License

MIT