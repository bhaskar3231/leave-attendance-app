import { test, expect, loginAs } from "./fixtures";

test.describe("Leave Balance", () => {
  test.beforeEach(async ({ page, asAdmin }) => {
    void asAdmin;
    await page.goto("/balance");
  });

  test("admin sees balance cards for all employees", async ({ page }) => {
    await expect(page.getByTestId("balance-card-u2")).toBeVisible();
    await expect(page.getByTestId("balance-card-u3")).toBeVisible();
    await expect(page.getByTestId("balance-card-u4")).toBeVisible();
    await expect(page.getByTestId("balance-card-u5")).toBeVisible();
  });

  test("balance card shows correct employee name", async ({ page }) => {
    await expect(page.getByTestId("balance-card-u2")).toContainText("Bob Smith");
    await expect(page.getByTestId("balance-card-u3")).toContainText("Carol White");
  });

  test("balance card shows leave categories", async ({ page }) => {
    const card = page.getByTestId("balance-card-u2");
    await expect(card).toContainText("Annual Leave");
    await expect(card).toContainText("Sick Leave");
    await expect(card).toContainText("Casual Leave");
  });

  test("employee only sees their own balance card", async ({ page }) => {
    await loginAs(page, "carol@acme.com");
    await page.goto("/balance");
    await expect(page.getByTestId("balance-card-u3")).toBeVisible();
    await expect(page.getByTestId("balance-card-u2")).not.toBeVisible();
  });
});
