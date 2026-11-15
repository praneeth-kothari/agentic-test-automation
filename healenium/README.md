# Healenium Self-Healing Demo

Standalone Java/Selenium module demonstrating **Healenium** — the open-source
self-healing library — inside a primarily TypeScript/Playwright repository.

## Why a separate Java module?

Healenium works with **Selenium (Java) only** — there is no official Playwright
port. So this repo demonstrates self-healing twice, in both ecosystems:

| Layer | Implementation | Where |
|---|---|---|
| Selenium/Java | Healenium library + hlm-backend + postgres | `healenium/` (this module) |
| Playwright/TypeScript | Custom Healer agent (`Patch`) that replays failures and patches locators | `agents/healer.ts` |

## How the demo works

`SelfHealingLoginTest` runs two ordered phases against saucedemo.com:

1. **Phase 1 — healthy locators.** Login succeeds with correct selectors.
   Healenium records element info (id, class, attributes) into its backing store.
2. **Phase 2 — broken locators.** The same elements are addressed with
   deliberately wrong locators (`#user-name-wrong`, `#password-wrong`,
   `#login-button-wrong`). None exist in the DOM. Healenium scores the stored
   element info against the live page, substitutes the healthy locator, and the
   login **still succeeds** — the test passes and the console shows
   `Locator healed: ... score: ...`

## Run it locally

```bash
# 1. Start the Healenium backend + postgres
docker compose -f healenium/docker-compose.yml up -d

# 2. Run the test (Chrome required)
cd healenium
mvn clean test
```

Screenshots and healing reports land in `healenium/.healenium/`.

## CI

The `healenium-demo` job in `.github/workflows/healenium.yml` starts the
docker-compose stack, runs `mvn test`, dumps backend logs, and uploads the
`.healenium/` reports as artifacts. It runs separately from the main
Playwright pipeline so the main suite stays green.
