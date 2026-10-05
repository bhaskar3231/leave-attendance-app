import { test, expect, loginAs } from "./fixtures";

test.describe("Profile Page", () => {
  test.describe("Employee profile (own)", () => {
    test.beforeEach(async ({ page, asEmployee }) => {
      void asEmployee;
      await page.goto("/profile");
    });

    test("profile page loads and shows user name", async ({ page }) => {
      await expect(page.getByTestId("profile-name")).toBeVisible();
      await expect(page.getByTestId("profile-name")).toContainText("Bob Smith");
    });

    test("profile page shows role badge", async ({ page }) => {
      await expect(page.getByTestId("profile-role-badge")).toBeVisible();
      await expect(page.getByTestId("profile-role-badge")).toContainText("employee");
    });

    test("edit profile button is visible for own profile", async ({ page }) => {
      await expect(page.getByTestId("edit-profile-btn")).toBeVisible();
    });

    test("can edit and save profile changes", async ({ page }) => {
      await page.getByTestId("edit-profile-btn").click();
      await expect(page.getByTestId("edit-profile-form")).toBeVisible();

      const posInput = page.getByTestId("profile-position-input");
      await posInput.clear();
      await posInput.fill("Principal Engineer");

      await page.getByTestId("save-profile-btn").click();
      await expect(page.getByTestId("edit-profile-form")).not.toBeVisible();
      await expect(page.getByTestId("profile-name")).toBeVisible();
    });
  });

  test.describe("Admin viewing another employee's profile", () => {
    test.beforeEach(async ({ page, asAdmin }) => {
      void asAdmin;
    });

    test("admin can view another user's profile at /profile/[id]", async ({ page }) => {
      await page.goto("/profile/u2");
      await expect(page.getByTestId("profile-card")).toBeVisible();
      await expect(page.getByTestId("profile-name")).toContainText("Bob Smith");
    });

    test("admin sees role badge on other profile", async ({ page }) => {
      await page.goto("/profile/u2");
      await expect(page.getByTestId("profile-role-badge")).toBeVisible();
    });

    test("sidebar profile nav link is accessible", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByTestId("nav-profile")).toBeVisible();
      await page.getByTestId("nav-profile").click();
      await expect(page).toHaveURL("/profile");
    });

    test("profile link in user menu works", async ({ page }) => {
      await page.goto("/");
      await page.getByTestId("user-menu-btn").click();
      await expect(page.getByTestId("profile-link")).toBeVisible();
      await page.getByTestId("profile-link").click();
      await expect(page).toHaveURL("/profile");
    });
  });

  test.describe("Employee cannot view other profiles directly", () => {
    test("employee gets redirect or not-found when viewing /profile/u3", async ({ page }) => {
      await loginAs(page, "bob@acme.com");
      // Employees see permission denied message at /profile/[id]
      await page.goto("/profile/u3");
      // Should show an error message (not-allowed) — not crash
      await expect(page.getByText(/permission|not have/i)).toBeVisible();
    });
  });
});
