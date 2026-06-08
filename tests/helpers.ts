import { expect, type Page } from "@playwright/test";

export async function runBench(page: Page) {
  await page.goto("/");
  await page.getByTestId("run-agent-task").click();
  await expect(page.getByTestId("verdict-card")).toBeVisible();
  await expect(page.getByTestId("receipt-card")).toBeVisible();
  const receiptHref = await page.locator("[data-testid='receipt-card'] a[href^='/receipt/']").getAttribute("href");
  expect(receiptHref).toBeTruthy();
  return receiptHref as string;
}

export async function runBenchForAgent(page: Page, agentTestId: string) {
  await page.goto("/run");
  await page.getByTestId(agentTestId).click();
  await page.getByTestId("run-agent-task").click();
  await expect(page.getByTestId("verdict-card")).toBeVisible();
  await expect(page.getByTestId("receipt-card")).toBeVisible();
}
