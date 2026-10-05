import { test, expect } from "./fixtures";

test.describe("Device Simulator", () => {
  test.beforeEach(async ({ page, asEmployee }) => {
    void asEmployee;
    await page.goto("/attendance");
  });

  test("device simulator panel renders", async ({ page }) => {
    await expect(page.getByTestId("device-simulator")).toBeVisible();
  });

  test("all 3 device buttons are visible", async ({ page }) => {
    await expect(page.getByTestId("device-btn-d1")).toBeVisible();
    await expect(page.getByTestId("device-btn-d2")).toBeVisible();
    await expect(page.getByTestId("device-btn-d3")).toBeVisible();
  });

  test("tapping a device button triggers a toast notification", async ({ page }) => {
    await page.getByTestId("device-btn-d1").click();
    await expect(page.getByTestId("toast-notification")).toBeVisible();
    await expect(page.getByTestId("toast-notification")).toContainText("Punch received");
  });

  test("first device punch clocks user in", async ({ page }) => {
    // Should start clocked out
    await expect(page.getByTestId("clock-in-btn")).toBeVisible();
    // Punch via HID card device
    await page.getByTestId("device-btn-d1").click();
    // Should now show clock-out button
    await expect(page.getByTestId("clock-out-btn")).toBeVisible();
    await expect(page.getByTestId("clock-in-btn")).not.toBeVisible();
  });

  test("second device punch clocks user out", async ({ page }) => {
    // Clock in first via manual button
    await page.getByTestId("clock-in-btn").click();
    await expect(page.getByTestId("clock-out-btn")).toBeVisible();
    // Punch via fingerprint device to clock out
    await page.getByTestId("device-btn-d2").click();
    // Both buttons should now be disabled (clocked out for today)
    const btn = page.locator("[data-testid='clock-in-btn'], [data-testid='clock-out-btn']");
    await expect(btn).toBeDisabled();
  });

  test("device punch adds a new attendance record to the table", async ({ page }) => {
    // Count rows before punch
    const initialRows = await page.locator("[data-testid^='attendance-row-']").count();
    // Punch in via face scanner
    await page.getByTestId("device-btn-d3").click();
    // There should be one more row
    const newRows = await page.locator("[data-testid^='attendance-row-']").count();
    expect(newRows).toBeGreaterThan(initialRows);
  });

  test("source badge appears for device-punched records", async ({ page }) => {
    // Pre-existing records from mock data have source badges
    await expect(page.getByTestId("source-badge-hid_card").first()).toBeVisible();
  });

  test("toast notification disappears after a few seconds", async ({ page }) => {
    await page.getByTestId("device-btn-d1").click();
    await expect(page.getByTestId("toast-notification")).toBeVisible();
    // Wait for auto-dismiss (4 seconds) + buffer
    await page.waitForTimeout(5000);
    await expect(page.getByTestId("toast-notification")).not.toBeVisible();
  });
});
