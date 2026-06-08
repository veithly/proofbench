import { expect, test } from "@playwright/test";
import { runBench } from "./helpers";

test("receipt detail exposes hash inputs and Mantle calldata", async ({ page }) => {
  const receiptHref = await runBench(page);
  await page.goto(receiptHref);

  await expect(page.getByText("Proof hash inputs")).toBeVisible();
  await expect(page.getByText("Score breakdown")).toBeVisible();
  await expect(page.getByTestId("mantle-proof-panel")).toContainText("0x");
  await expect(page.getByTestId("download-json")).toBeVisible();
});
