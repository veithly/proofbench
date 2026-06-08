import { expect, test } from "@playwright/test";
import { runBenchForAgent } from "./helpers";

test("YieldChaser standard run creates a FAIL no-payout receipt", async ({ page }) => {
  await runBenchForAgent(page, "agent-yieldchaser");

  await expect(page.getByTestId("verdict-card")).toContainText("FAIL");
  await expect(page.getByTestId("verdict-card")).toContainText("0 simulated MNT");
});
