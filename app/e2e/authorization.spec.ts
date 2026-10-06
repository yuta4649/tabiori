import { expect, test } from "@playwright/test";
import { USERS } from "./users";

// Alice（このプロジェクトの既定のログインユーザー）が作った旅行を、
// Bob が URL を直接指定して開こうとしても見られないことを確認する。
test("another user cannot open a trip by its URL", async ({ page, browser }) => {
  const title = `Alice の秘密の旅行 ${Date.now()}`;

  // Alice: 旅行・行きたい場所・予定を作る
  await page.goto("/trips/new");
  await page.getByLabel("タイトル").fill(title);
  await page.getByLabel("行き先").fill("函館");
  await page.getByLabel("開始日").fill("2026-11-03");
  await page.getByLabel("終了日").fill("2026-11-04");
  await page.getByRole("button", { name: "作成する" }).click();
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  const tripPath = new URL(page.url()).pathname;

  await page.getByRole("link", { name: "＋ 追加" }).click();
  await page.getByLabel("名前").fill("函館山");
  await page.getByRole("button", { name: "追加する" }).click();
  await page.locator("#places").getByRole("link", { name: /函館山/ }).click();
  const placeEditPath = new URL(page.url()).pathname;
  await page.goto(tripPath);

  await page.getByRole("link", { name: "＋ 11/3（火） に予定を追加" }).click();
  await page.getByLabel("予定").fill("秘密の予定");
  await page.getByRole("button", { name: "追加する" }).click();
  await page.getByRole("link", { name: /秘密の予定/ }).click();
  const itemEditPath = new URL(page.url()).pathname;

  // Bob: 同じ URL を直接開く
  const bobContext = await browser.newContext({ storageState: USERS.bob.storageState });
  const bob = await bobContext.newPage();
  try {
    for (const path of [
      tripPath,
      `${tripPath}/edit`,
      `${tripPath}/places/new`,
      `${tripPath}/schedule/new`,
      placeEditPath,
      itemEditPath,
    ]) {
      const response = await bob.goto(path);
      expect(response?.status(), path).toBe(404);
      await expect(bob.getByText("ページが見つかりません")).toBeVisible();
      await expect(bob.getByText(title)).toHaveCount(0);
    }

    await bob.goto("/trips");
    await expect(bob.getByText(`${USERS.bob.name} でログイン中`)).toBeVisible();
    await expect(bob.getByText(title)).toHaveCount(0);
  } finally {
    await bobContext.close();
  }

  // 後片付け（Alice）
  await page.goto(`${tripPath}/edit`);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "この旅行を削除" }).click();
  await expect(page).toHaveURL(/\/trips$/);
});
