import { expect, test } from "@playwright/test";
import { runBenchForAgent } from "./helpers";

test("DeltaScout standard run creates a PASS receipt", async ({ page }) => {
  await runBenchForAgent(page, "agent-deltascout");

  await expect(page.getByTestId("verdict-card")).toContainText("PASS");
  await expect(page.getByTestId("verdict-card")).toContainText("10 simulated MNT");
  await expect(page.getByTestId("receipt-hash")).toContainText("0x");
});
