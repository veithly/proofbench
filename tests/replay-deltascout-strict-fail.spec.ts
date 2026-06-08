import { expect, test } from "@playwright/test";
import { runBenchForAgent } from "./helpers";

test("ledger replays DeltaScout under strict evaluator without mutating receipt", async ({ page }) => {
  await runBenchForAgent(page, "agent-deltascout");
  await page.goto("/ledger");

  await page.getByRole("button", { name: /replay strict/i }).click();
  await expect(page.getByTestId("replay-result")).toBeVisible();
  await expect(page.getByTestId("replay-result")).toContainText("FAIL");
  await expect(page.getByTestId("replay-result")).toContainText("strict");
});
