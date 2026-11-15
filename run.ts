/**
 * Pipeline orchestrator: Planner → Generator → Playwright test → Healer
 *
 * Usage: npx tsx run.ts "https://www.saucedemo.com" "login and browse inventory"
 */

import { runPlanner } from "./agents/planner.js";
import { runGenerator } from "./agents/generator.js";
import { runHealer } from "./agents/healer.js";
import { execSync } from "node:child_process";

const url = process.argv[2] || "https://www.saucedemo.com";
const seed = process.argv[3] || "login and browse inventory";

async function main() {
  console.log("=".repeat(66));
  console.log("AGENTIC TEST AUTOMATION PIPELINE");
  console.log("=".repeat(66));

  // Phase 1: Planner
  console.log("\n[Phase 1] Planner Agent (Aria)");
  console.log("-".repeat(66));
  const specFile = await runPlanner(url, seed, "specs", "Swag Labs");

  // Phase 2: Generator
  console.log("\n[Phase 2] Generator Agent (Bolt)");
  console.log("-".repeat(66));
  const generated = runGenerator("specs", "tests");

  // Phase 3: Run Playwright tests
  console.log("\n[Phase 3] Running Playwright tests");
  console.log("-".repeat(66));
  let testPassed = false;
  try {
    execSync("npx playwright test", { stdio: "inherit", timeout: 120000 });
    testPassed = true;
  } catch {
    testPassed = false;
  }

  // Phase 4: Healer (if failures)
  if (!testPassed) {
    console.log("\n[Phase 4] Healer Agent (Patch)");
    console.log("-".repeat(66));
    const healed = runHealer("tests", 3);
    if (healed) {
      console.log("\nAll tests healed and passing!");
    } else {
      console.log("\nSome tests could not be healed automatically.");
    }
  } else {
    console.log("\nAll tests passed on first run — no healing needed.");
  }

  console.log("\n" + "=".repeat(66));
  console.log("PIPELINE COMPLETE");
  console.log("=".repeat(66));
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});