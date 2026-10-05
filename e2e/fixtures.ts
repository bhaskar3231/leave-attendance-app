import { test as base, expect, type Page } from "@playwright/test";

// ─── Login helper ─────────────────────────────────────────────────────────────
async function loginAs(page: Page, email: string) {
  await page.goto("/login");
  await page.getByTestId("email-input").fill(email);
  await page.getByTestId("password-input").fill("Password1!");
  await page.getByTestId("login-submit-btn").click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10_000 });
}

// ─── Extended test with admin/employee login fixtures ────────────────────────
export const test = base.extend<{
  asAdmin:    void;
  asEmployee: void;
}>({
  asAdmin: async ({ page }, use) => {
    await loginAs(page, "alice@acme.com");
    await use();
  },
  asEmployee: async ({ page }, use) => {
    await loginAs(page, "bob@acme.com");
    await use();
  },
});

export { expect };
export { loginAs };
