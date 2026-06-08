import { expect, test } from "@playwright/test";
import { runBench } from "./helpers";

test("fresh visitor reaches a payout receipt inside the 60 second budget", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const started = Date.now();

  const receiptHref = await runBench(page);
  await expect(page.locator("[data-next-step-cta]").first()).toBeVisible();

  const elapsed = Date.now() - started;
  expect(elapsed).toBeLessThanOrEqual(60000);

  await page.goto(receiptHref);
  await expect(page.getByText("Proof hash inputs")).toBeVisible();
  await context.close();
});
