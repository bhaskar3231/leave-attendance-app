import { test, expect, loginAs } from "./fixtures";

test.describe("Admin Panel", () => {
  test.beforeEach(async ({ page, asAdmin }) => {
    void asAdmin;
    await page.goto("/admin");
  });

  test("admin table renders all employees", async ({ page }) => {
    await expect(page.getByTestId("admin-table")).toBeVisible();
    await expect(page.getByTestId("admin-row-u1")).toBeVisible();
    await expect(page.getByTestId("admin-row-u2")).toBeVisible();
    await expect(page.getByTestId("admin-row-u5")).toBeVisible();
  });

  test("can add a new employee", async ({ page }) => {
    await page.getByTestId("add-employee-btn").click();
    await expect(page.getByTestId("user-modal")).toBeVisible();

    await page.getByTestId("user-name-input").fill("Frank Miller");
    await page.getByTestId("user-email-input").fill("frank@acme.com");
    await page.getByTestId("user-dept-select").selectOption("Finance");
    await page.getByTestId("user-position-input").fill("Financial Analyst");

    await page.getByTestId("save-user-btn").click();
    await expect(page.getByTestId("user-modal")).not.toBeVisible();
    await expect(page.getByText("Frank Miller")).toBeVisible();
    await expect(page.getByText("frank@acme.com")).toBeVisible();
  });

  test("shows validation error when saving empty name", async ({ page }) => {
    await page.getByTestId("add-employee-btn").click();
    // Leave name empty
    await page.getByTestId("user-email-input").fill("test@acme.com");
    await page.getByTestId("user-position-input").fill("Dev");
    await page.getByTestId("save-user-btn").click();
    await expect(page.getByRole("alert")).toBeVisible();
    // Modal stays open
    await expect(page.getByTestId("user-modal")).toBeVisible();
  });

  test("can edit an existing employee", async ({ page }) => {
    await page.getByTestId("edit-btn-u2").click();
    await expect(page.getByTestId("user-modal")).toBeVisible();
    const posInput = page.getByTestId("user-position-input");
    await posInput.clear();
    await posInput.fill("Lead Engineer");
    await page.getByTestId("save-user-btn").click();
    await expect(page.getByTestId("user-modal")).not.toBeVisible();
    await expect(page.getByTestId("admin-row-u2")).toContainText("Lead Engineer");
  });

  test("can delete an employee (not self)", async ({ page }) => {
    await page.getByTestId("delete-btn-u3").click();
    await expect(page.getByTestId("delete-confirm-modal")).toBeVisible();
    await expect(page.getByText("Carol White")).toBeVisible();
    await page.getByTestId("confirm-delete-btn").click();
    await expect(page.getByTestId("delete-confirm-modal")).not.toBeVisible();
    await expect(page.getByTestId("admin-row-u3")).not.toBeVisible();
  });

  test("delete button for self is disabled", async ({ page }) => {
    await expect(page.getByTestId("delete-btn-u1")).toBeDisabled();
  });

  test("non-admin employee is redirected from /admin", async ({ page }) => {
    await loginAs(page, "bob@acme.com");
    await page.goto("/admin");
    // Middleware redirects to dashboard
    await expect(page).toHaveURL("/");
  });
});
