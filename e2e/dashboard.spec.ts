import { test, expect, loginAs } from "./fixtures";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page, asAdmin }) => {
    void asAdmin;
    await page.goto("/");
  });

  test("renders sidebar and topbar", async ({ page }) => {
    await expect(page.getByTestId("sidebar")).toBeVisible();
    await expect(page.getByTestId("topbar")).toBeVisible();
  });

  test("shows all 4 stat cards", async ({ page }) => {
    await expect(page.getByTestId("stat-employees")).toBeVisible();
    await expect(page.getByTestId("stat-pending")).toBeVisible();
    await expect(page.getByTestId("stat-present")).toBeVisible();
    await expect(page.getByTestId("stat-approved")).toBeVisible();
  });

  test("stat-employees shows 5 users", async ({ page }) => {
    await expect(page.getByTestId("stat-employees")).toContainText("5");
  });

  test("renders recent leave requests table", async ({ page }) => {
    await expect(page.getByTestId("recent-leaves-table")).toBeVisible();
  });

  test("renders recent attendance table", async ({ page }) => {
    await expect(page.getByTestId("recent-attendance-table")).toBeVisible();
  });

  test("notification bell shows pending count badge (admin)", async ({ page }) => {
    const bell = page.getByTestId("notification-bell");
    await expect(bell).toBeVisible();
    await expect(bell).toContainText("2");
  });

  test("navigates to Leave Requests page via sidebar", async ({ page }) => {
    await page.getByTestId("nav-leave").click();
    await expect(page).toHaveURL("/leave");
    await expect(page.getByTestId("leave-table")).toBeVisible();
  });

  test("navigates to Attendance page via sidebar", async ({ page }) => {
    await page.getByTestId("nav-attendance").click();
    await expect(page).toHaveURL("/attendance");
    // Device simulator and table visible on attendance page
    await expect(page.getByTestId("device-simulator")).toBeVisible();
  });

  test("navigates to Leave Balance page via sidebar", async ({ page }) => {
    await page.getByTestId("nav-balance").click();
    await expect(page).toHaveURL("/balance");
  });

  test("navigates to Admin page via sidebar", async ({ page }) => {
    await page.getByTestId("nav-admin").click();
    await expect(page).toHaveURL("/admin");
    await expect(page.getByTestId("admin-table")).toBeVisible();
  });

  test("employee does not see notification bell", async ({ page }) => {
    await loginAs(page, "bob@acme.com");
    await page.goto("/");
    await expect(page.getByTestId("notification-bell")).not.toBeVisible();
  });
});
