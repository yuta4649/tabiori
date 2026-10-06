import { expect, test } from "@playwright/test";
import { E2E_PASSWORD, USERS } from "./users";

// このファイルは未ログインの状態から始める
test.use({ storageState: { cookies: [], origins: [] } });

test("redirects to the login page when signed out", async ({ page }) => {
  await page.goto("/trips");
  await expect(page).toHaveURL(/\/login\?next=%2Ftrips$/);
  await expect(page.getByRole("heading", { name: "tabiori" })).toBeVisible();
});

test("signs in, lands on /trips, and signs out", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("メールアドレス").fill(USERS.alice.email);
  await page.getByLabel("パスワード").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL(/\/trips$/);
  await expect(page.getByText(`${USERS.alice.name} でログイン中`)).toBeVisible();

  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/trips");
  await expect(page).toHaveURL(/\/login\?next=%2Ftrips$/);
});

test("returns to the requested page after signing in", async ({ page }) => {
  await page.goto("/trips/new");
  await expect(page).toHaveURL(/\/login\?next=%2Ftrips%2Fnew$/);

  await page.getByLabel("メールアドレス").fill(USERS.alice.email);
  await page.getByLabel("パスワード").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL(/\/trips\/new$/);
  await expect(page.getByRole("heading", { name: "旅行を作成" })).toBeVisible();
});

test("rejects a wrong password", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("メールアドレス").fill(USERS.alice.email);
  await page.getByLabel("パスワード").fill("wrong-password");
  await page.getByRole("button", { name: "ログイン" }).click();

  // Next.js のルートアナウンサーも role="alert" を持つため、文言で特定する
  await expect(
    page.getByRole("alert").filter({ hasText: "メールアドレスまたはパスワードが正しくありません" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("keeps the health check public", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
});
