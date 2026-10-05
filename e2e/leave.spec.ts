import { test, expect, loginAs } from "./fixtures";

test.describe("Leave Requests", () => {
  test.beforeEach(async ({ page, asAdmin }) => {
    void asAdmin;
    await page.goto("/leave");
  });

  test("leave table is visible with mock data", async ({ page }) => {
    await expect(page.getByTestId("leave-table")).toBeVisible();
    await expect(page.getByTestId("leave-row-lr1")).toBeVisible();
  });

  test("filter buttons exist and filter correctly", async ({ page }) => {
    await page.getByTestId("filter-pending").click();
    await expect(page.getByTestId("leave-row-lr2")).not.toBeVisible();
    await expect(page.getByTestId("leave-row-lr1")).toBeVisible();

    await page.getByTestId("filter-approved").click();
    await expect(page.getByTestId("leave-row-lr1")).not.toBeVisible();
    await expect(page.getByTestId("leave-row-lr2")).toBeVisible();

    await page.getByTestId("filter-rejected").click();
    await expect(page.getByTestId("leave-row-lr3")).toBeVisible();

    await page.getByTestId("filter-all").click();
    await expect(page.getByTestId("leave-row-lr1")).toBeVisible();
    await expect(page.getByTestId("leave-row-lr2")).toBeVisible();
  });

  test("employee can apply a new leave request", async ({ page }) => {
    await loginAs(page, "bob@acme.com");
    await page.goto("/leave");

    await page.getByTestId("apply-leave-btn").click();
    await expect(page.getByTestId("apply-leave-modal")).toBeVisible();

    await page.getByTestId("leave-type-select").selectOption("Sick");
    await page.getByTestId("leave-start-date").fill("2024-09-01");
    await page.getByTestId("leave-end-date").fill("2024-09-02");
    await page.getByTestId("leave-reason").fill("Doctor appointment");
    await page.getByTestId("submit-leave-btn").click();

    await expect(page.getByTestId("apply-leave-modal")).not.toBeVisible();
    await expect(page.getByText("Doctor appointment")).toBeVisible();
  });

  test("leave form rejects end date before start date", async ({ page }) => {
    await page.getByTestId("apply-leave-btn").click();
    await page.getByTestId("leave-start-date").fill("2024-09-05");
    await page.getByTestId("leave-end-date").fill("2024-09-03");
    await page.getByTestId("leave-reason").fill("Test reason");
    await page.getByTestId("submit-leave-btn").click();
    // Modal stays open — validation error shown
    await expect(page.getByTestId("apply-leave-modal")).toBeVisible();
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("admin can approve a pending leave request", async ({ page }) => {
    await page.getByTestId("review-btn-lr1").click();
    await expect(page.getByTestId("review-leave-modal")).toBeVisible();
    await page.getByTestId("review-note").fill("Approved, have a great trip!");
    await page.getByTestId("approve-btn").click();
    await expect(page.getByTestId("review-leave-modal")).not.toBeVisible();
    await expect(page.getByTestId("leave-row-lr1")).toContainText("Approved");
  });

  test("admin can reject a pending leave request", async ({ page }) => {
    await page.getByTestId("review-btn-lr4").click();
    await page.getByTestId("reject-btn").click();
    await expect(page.getByTestId("review-leave-modal")).not.toBeVisible();
    await expect(page.getByTestId("leave-row-lr4")).toContainText("Rejected");
  });

  test("employee cannot see review buttons", async ({ page }) => {
    await loginAs(page, "bob@acme.com");
    await page.goto("/leave");
    await expect(page.getByTestId("review-btn-lr1")).not.toBeVisible();
  });
});
