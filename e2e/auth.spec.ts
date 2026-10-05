import { test, expect, type Page } from "@playwright/test";

// ─── Helper: log in via the login page ───────────────────────────────────────
async function login(page: Page, email: string, password = "Password1!") {
  await page.goto("/login");
  await page.getByTestId("email-input").fill(email);
  await page.getByTestId("password-input").fill(password);
  await page.getByTestId("login-submit-btn").click();
  // Wait for redirect away from /login
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10_000 });
}

test.describe("Authentication", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-page")).toBeVisible();
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("password-input")).toBeVisible();
    await expect(page.getByTestId("login-submit-btn")).toBeVisible();
  });

  test("shows error on wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("email-input").fill("alice@acme.com");
    await page.getByTestId("password-input").fill("wrongpassword");
    await page.getByTestId("login-submit-btn").click();
    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page.getByTestId("login-error")).toContainText("Invalid email or password");
  });

  test("shows error on empty form submission", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-submit-btn").click();
    await expect(page.getByTestId("login-error")).toBeVisible();
  });

  test("admin can log in and sees dashboard", async ({ page }) => {
    await login(page, "alice@acme.com");
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("sidebar")).toBeVisible();
    // Admin sees Admin nav link
    await expect(page.getByTestId("nav-admin")).toBeVisible();
  });

  test("employee can log in and does not see admin nav", async ({ page }) => {
    await login(page, "bob@acme.com");
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("nav-admin")).not.toBeVisible();
  });

  test("demo buttons pre-fill credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("demo-admin").click();
    await expect(page.getByTestId("email-input")).toHaveValue("alice@acme.com");
    await expect(page.getByTestId("password-input")).toHaveValue("Password1!");
  });

  test("unauthenticated user is redirected to /login from protected route", async ({ page }) => {
    // Fresh context — no cookie
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("authenticated user is redirected away from /login", async ({ page }) => {
    await login(page, "alice@acme.com");
    await page.goto("/login");
    // Should be redirected to dashboard
    await expect(page).toHaveURL("/");
  });

  test("user menu shows logged-in user name", async ({ page }) => {
    await login(page, "alice@acme.com");
    await page.getByTestId("user-menu-btn").click();
    await expect(page.getByTestId("user-dropdown")).toBeVisible();
    await expect(page.getByTestId("user-dropdown")).toContainText("alice@acme.com");
  });

  test("change password link is visible in user menu", async ({ page }) => {
    await login(page, "bob@acme.com");
    await page.getByTestId("user-menu-btn").click();
    await expect(page.getByTestId("change-password-link")).toBeVisible();
  });

  test("logout redirects to /login", async ({ page }) => {
    await login(page, "alice@acme.com");
    await page.getByTestId("user-menu-btn").click();
    await page.getByTestId("logout-btn").click();
    await expect(page).toHaveURL("/login");
  });

  test("employee cannot access /admin — redirected to dashboard", async ({ page }) => {
    await login(page, "bob@acme.com");
    await page.goto("/admin");
    await expect(page).toHaveURL("/");
  });
});

test.describe("Change Password", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "bob@acme.com");
    await page.goto("/change-password");
  });

  test("change password page renders", async ({ page }) => {
    await expect(page.getByTestId("current-pw-input")).toBeVisible();
    await expect(page.getByTestId("new-pw-input")).toBeVisible();
    await expect(page.getByTestId("confirm-pw-input")).toBeVisible();
  });

  test("shows error when current password is wrong", async ({ page }) => {
    await page.getByTestId("current-pw-input").fill("WrongPass1!");
    await page.getByTestId("new-pw-input").fill("NewPass2@");
    await page.getByTestId("confirm-pw-input").fill("NewPass2@");
    await page.getByTestId("change-pw-submit").click();
    await expect(page.getByTestId("change-pw-error")).toBeVisible();
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await page.getByTestId("current-pw-input").fill("Password1!");
    await page.getByTestId("new-pw-input").fill("NewPass2@");
    await page.getByTestId("confirm-pw-input").fill("DifferentPass3#");
    await page.getByTestId("change-pw-submit").click();
    await expect(page.getByTestId("change-pw-error")).toBeVisible();
    await expect(page.getByTestId("change-pw-error")).toContainText("do not match");
  });
});
