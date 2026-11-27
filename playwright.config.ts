// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env["E2E_BASE_URL"];
const localUrl = "http://localhost:4173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: process.env["CI"] !== undefined,
  retries: process.env["CI"] !== undefined ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: externalBaseUrl ?? localUrl,
    trace: "on-first-retry",
    serviceWorkers: "allow",
  },
  projects: [{ name: "chromium", use: { ...devices["Pixel 7"] } }],
  webServer:
    externalBaseUrl === undefined
      ? {
          command:
            "npm run build && npm run preview -- --port 4173 --strictPort",
          url: localUrl,
          env: { VITE_DEMO: "on" },
          reuseExistingServer: process.env["CI"] === undefined,
          timeout: 120_000,
        }
      : undefined,
});
