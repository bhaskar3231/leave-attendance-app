import { test, expect, loginAs } from "./fixtures";

test.describe("Attendance Tracking", () => {
  test.beforeEach(async ({ page, asEmployee }) => {
    void asEmployee;
    await page.goto("/attendance");
  });

  test("renders attendance table with mock records", async ({ page }) => {
    await expect(page.getByTestId("attendance-table")).toBeVisible();
    // Bob's records are visible
    await expect(page.getByTestId("attendance-row-a1")).toBeVisible();
  });

  test("clock in button is visible for employee", async ({ page }) => {
    await expect(page.getByTestId("clock-in-btn")).toBeVisible();
  });

  test("employee can clock in and button changes to clock out", async ({ page }) => {
    await page.getByTestId("clock-in-btn").click();
    await expect(page.getByTestId("clock-out-btn")).toBeVisible();
    await expect(page.getByTestId("clock-in-btn")).not.toBeVisible();
  });

  test("employee can clock out after clocking in", async ({ page }) => {
    await page.getByTestId("clock-in-btn").click();
    await page.getByTestId("clock-out-btn").click();
    // After clock out, button disabled
    const btn = page.locator("[data-testid='clock-in-btn'], [data-testid='clock-out-btn']");
    await expect(btn).toBeDisabled();
  });

  test("admin can filter attendance by employee", async ({ page }) => {
    await loginAs(page, "alice@acme.com");
    await page.goto("/attendance");
    const filter = page.getByTestId("attendance-employee-filter");
    await expect(filter).toBeVisible();
    await filter.selectOption("u2");
    const rows = page.locator("[data-testid^='attendance-row-']");
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText("Bob Smith");
    }
  });

  test("employee does not see admin filter", async ({ page }) => {
    await expect(page.getByTestId("attendance-employee-filter")).not.toBeVisible();
  });

  test("attendance records show source badges", async ({ page }) => {
    // a1 has hid_card source
    const row = page.getByTestId("attendance-row-a1");
    await expect(row).toBeVisible();
    await expect(page.getByTestId("source-badge-hid_card").first()).toBeVisible();
  });

  test("device simulator panel is visible", async ({ page }) => {
    await expect(page.getByTestId("device-simulator")).toBeVisible();
  });
});
