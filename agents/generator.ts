/**
 * Generator Agent (Bolt) — reads Markdown test plans and generates
 * executable Playwright TypeScript test files.
 */

import * as fs from "node:fs";
import * as path from "node:path";

interface TestCase {
  id: string;
  title: string;
  precondition: string;
  steps: string[];
  expected: string;
}

/** Parse test cases from a Markdown spec file. */
export function parseSpec(markdown: string): TestCase[] {
  const cases: TestCase[] = [];
  const tcPattern = /### (TC-\d+):\s*(.+)/g;
  const lines = markdown.split("\n");

  let current: TestCase | null = null;
  for (const line of lines) {
    const match = tcPattern.exec(line);
    if (match) {
      if (current) cases.push(current);
      current = { id: match[1], title: match[2].trim(), precondition: "", steps: [], expected: "" };
    } else if (current) {
      if (line.startsWith("- **Precondition**")) {
        current.precondition = line.replace("- **Precondition**: ", "").trim();
      } else if (line.match(/^\s+\d+\./)) {
        current.steps.push(line.replace(/^\s+\d+\.\s*/, "").trim());
      } else if (line.startsWith("- **Expected**")) {
        current.expected = line.replace("- **Expected**: ", "").trim();
      }
    }
    tcPattern.lastIndex = 0;
  }
  if (current) cases.push(current);
  return cases;
}

/** Generate a Playwright TypeScript spec file from parsed test cases. */
export function generateSpec(testCases: TestCase[], pageName: string, url: string): string {
  const imports = `import { test, expect } from "@playwright/test";\n`;
  const describeBlock = `describe("${pageName}", () => {\n`;

  const testBlocks = testCases.map((tc) => {
    const testName = `${tc.id}: ${tc.title}`;
    const steps = tc.steps
      .map((s, i) => `    // Step ${i + 1}: ${s}`)
      .join("\n");

    // Detect the test type from the title/steps
    const isNegative = tc.title.toLowerCase().includes("invalid") || tc.title.toLowerCase().includes("empty");
    const username = isNegative ? "invalid_user" : "standard_user";
    const password = isNegative ? "wrong_password" : "secret_sauce";
    const isError = isNegative;

    return `  test("${testName}", async ({ page }) => {\n${steps}\n\n    await page.goto("/");\n${
      tc.steps.some((s) => s.includes("empty"))
        ? `    await page.click('[data-test="login-button"]');`
        : `    await page.fill('[data-test="user-name"]', "${username}");\n    await page.fill('[data-test="password"]', "${password}");\n    await page.click('[data-test="login-button"]');`
    }\n\n    ${
      isError
        ? `// Expected: ${tc.expected}\n    await expect(page.locator('[data-test="error"]')).toBeVisible();`
        : `// Expected: ${tc.expected}\n    await expect(page).toHaveURL(/.*inventory/);`
    }\n  });`;
  });

  return `${imports}\n\n${describeBlock}${testBlocks.join("\n\n")}\n});\n`;
}

/** Main entry point for the Generator agent. */
export function runGenerator(specsDir: string, testsDir: string): string[] {
  const generated: string[] = [];
  const specFiles = fs.readdirSync(specsDir).filter((f) => f.endsWith(".md"));

  for (const specFile of specFiles) {
    const specPath = path.join(specsDir, specFile);
    const markdown = fs.readFileSync(specPath, "utf-8");
    const testCases = parseSpec(markdown);

    if (testCases.length === 0) {
      console.warn(`[Generator] No test cases found in ${specFile}`);
      continue;
    }

    const pageName = path.basename(specFile, ".md");
    const specCode = generateSpec(testCases, pageName, "https://www.saucedemo.com");

    fs.mkdirSync(testsDir, { recursive: true });
    const testFile = path.join(testsDir, `${pageName}.spec.ts`);
    fs.writeFileSync(testFile, specCode, "utf-8");
    generated.push(testFile);
    console.log(`[Generator] Generated ${testFile} (${testCases.length} test cases)`);
  }

  return generated;
}