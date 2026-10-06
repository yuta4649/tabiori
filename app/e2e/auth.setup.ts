import { execFileSync } from "node:child_process";
import { expect, test as setup } from "@playwright/test";
import { E2E_PASSWORD, USERS } from "./users";

for (const user of Object.values(USERS)) {
  setup(`sign in as ${user.name}`, async ({ page }) => {
    // 画面からの新規登録は無効なので、CLI で作成する（既存ならパスワードを更新）
    execFileSync("pnpm", ["-s", "user:create", "--email", user.email, "--name", user.name], {
      env: { ...process.env, TABIORI_USER_PASSWORD: E2E_PASSWORD },
      stdio: "pipe",
    });

    await page.goto("/login");
    await page.getByLabel("メールアドレス").fill(user.email);
    await page.getByLabel("パスワード").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL(/\/trips$/);

    await page.context().storageState({ path: user.storageState });
  });
}
