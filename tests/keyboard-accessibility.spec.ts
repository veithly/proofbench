import { expect, test } from "@playwright/test";

test("Cmd-K opens the command palette and can run the hero path", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await expect(page.getByRole("dialog", { name: /command palette/i })).toBeVisible();
  await page.getByRole("button", { name: "Run agent task" }).last().click();
  await expect(page.getByTestId("receipt-card")).toBeVisible();
});
