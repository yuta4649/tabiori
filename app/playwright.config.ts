import { defineConfig, devices } from "@playwright/test";
import { USERS } from "./e2e/users";

const port = 3000;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    // テストユーザーを作成してログイン状態を保存する
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"], storageState: USERS.alice.storageState },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
  },
});
