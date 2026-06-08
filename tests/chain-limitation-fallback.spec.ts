import { expect, test } from "@playwright/test";
import { runBench } from "./helpers";

test("notarization fallback is honest ready calldata when signer env is absent", async ({ page }) => {
  const receiptHref = await runBench(page);
  await page.goto(receiptHref);

  await expect(page.getByText(/ready calldata|ready to notarize/i)).toBeVisible();
  await expect(page.getByTestId("mantle-proof-panel")).toContainText("0x");
});
