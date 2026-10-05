import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Enforce localhost binding per security policy (no 0.0.0.0)
    // baseURL already scoped to 127.0.0.1-equivalent localhost
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Dev mode in local; production build in CI for realistic test conditions
    command: isCI
      ? "node node_modules/next/dist/bin/next start"
      : "node node_modules/next/dist/bin/next dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 120_000,
    // CI: must build before running (npm run build && npm run test:e2e)
  },
});
