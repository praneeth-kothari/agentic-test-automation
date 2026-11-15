/**
 * Healer Agent (Patch) — replays failing tests, inspects errors,
 * patches broken locators, and re-runs until tests pass.
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

interface TestFailure {
  testFile: string;
  testName: string;
  errorMessage: string;
  failingLocator: string | null;
}

interface HealingAction {
  file: string;
  original: string;
  replacement: string;
  reason: string;
}

/** Run Playwright tests and return the JSON results. */
function runTests(): { failures: TestFailure[]; passed: number; total: number } {
  try {
    const output = execSync("npx playwright test --reporter=json 2>&1", {
      encoding: "utf-8",
      timeout: 120000,
      cwd: process.cwd(),
    });
    return parseResults(output);
  } catch (err: any) {
    // Playwright exits with non-zero on failures — parse stdout
    const stdout = err.stdout || "";
    return parseResults(stdout);
  }
}

/** Parse Playwright JSON reporter output for failures. */
function parseResults(output: string): { failures: TestFailure[]; passed: number; total: number } {
  const failures: TestFailure[] = [];
  let passed = 0;
  let total = 0;

  // Playwright JSON reporter outputs a JSON blob — find it
  const jsonMatch = output.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { failures, passed, total };

  try {
    const results = JSON.parse(jsonMatch[0]);
    for (const suite of results.suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          total++;
          const ok = test.results?.every((r: any) => r.status === "passed");
          if (ok) { passed++; continue; }
          const failedResult = test.results?.find((r: any) => r.status !== "passed");
          if (failedResult) {
            const errMsg = failedResult.error?.message || "Unknown error";
            const locatorMatch = errMsg.match(/locator\((.*?)\)/);
            failures.push({
              testFile: suite.file || "unknown",
              testName: spec.title || "unknown",
              errorMessage: errMsg.slice(0, 300),
              failingLocator: locatorMatch ? locatorMatch[1] : null,
            });
          }
        }
      }
    }
  } catch (parseErr) {
    console.error("[Healer] Failed to parse JSON results:", parseErr);
  }

  return { failures, passed, total };
}

/** Propose healing actions for a failing test. */
function proposeHealing(failure: TestFailure): HealingAction[] {
  const actions: HealingAction[] = [];
  if (!failure.failingLocator) return actions;

  const locator = failure.failingLocator;
  // Strategy: data-test → CSS → text → role-based
  const alternatives: string[] = [];

  if (locator.includes("data-test=")) {
    const value = locator.match(/data-test=['"](.+?)['"]/)?.[1] || "";
    alternatives.push(`#${value}`);
    alternatives.push(`text=${value.replace(/-/g, " ")}`);
    alternatives.push(`getByRole('button', { name: '${value.replace(/-/g, " ")}' })`);
  } else if (locator.startsWith("#")) {
    const id = locator.slice(1);
    alternatives.push(`[data-test='${id}']`);
    alternatives.push(`text=${id.replace(/-/g, " ")}`);
  }

  for (const alt of alternatives.slice(0, 2)) {
    actions.push({
      file: failure.testFile,
      original: locator,
      replacement: alt,
      reason: `Healing: replaced broken locator ${locator} with ${alt}`,
    });
  }
  return actions;
}

/** Apply healing actions to test files. */
function applyHealings(actions: HealingAction[]): void {
  for (const action of actions) {
    const filePath = path.resolve(action.file);
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, "utf-8");
    if (!content.includes(action.original)) continue;
    content = content.replaceAll(action.original, action.replacement);
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`[Healer] Patched ${action.file}: ${action.original} → ${action.replacement}`);
  }
}

/** Main entry point for the Healer agent. */
export function runHealer(testsDir: string, maxAttempts: number = 3): boolean {
  console.log("[Healer] Starting self-healing loop...");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[Healer] Attempt ${attempt}/${maxAttempts}`);
    const results = runTests();
    console.log(`[Healer] ${results.passed}/${results.total} passed, ${results.failures.length} failures`);

    if (results.failures.length === 0) {
      console.log("[Healer] All tests passing!");
      return true;
    }

    for (const failure of results.failures) {
      console.log(`[Healer] Failure: ${failure.testName}`);
      console.log(`  Error: ${failure.errorMessage.slice(0, 150)}`);
      const actions = proposeHealing(failure);
      if (actions.length > 0) {
        applyHealings(actions);
      } else {
        console.log(`  [Healer] No healing strategy found for this failure`);
      }
    }
  }

  console.log("[Healer] Max healing attempts reached — some tests still failing");
  return false;
}