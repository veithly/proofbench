import { expect, test } from "@playwright/test";
import { runBench } from "./helpers";

test("notarization anchors a real Mantle Sepolia event when relayer is configured", async ({ page }) => {
  const receiptHref = await runBench(page);
  await expect(page.getByTestId("receipt-card")).toContainText(/sepolia anchored/i);
  await expect(page.getByTestId("sepolia-tx-hash")).toContainText("0x");
  await page.goto(receiptHref);

  await expect(page.getByText(/sepolia anchored/i)).toBeVisible();
  await expect(page.getByTestId("mantle-proof-panel")).toContainText("0x");
  await expect(page.getByRole("link", { name: /open sepolia event/i })).toBeVisible();
});
