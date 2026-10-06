import { expect, test, type Page } from "@playwright/test";

// スマホ（Pixel 7）で「旅行を作る → 行きたい場所を登録する → スケジュールを作る → 見る」を通す

async function addScheduleItem(
  page: Page,
  dayLabel: string,
  item: { startTime?: string; endTime?: string; title: string; place?: string; location?: string },
) {
  await page.getByRole("link", { name: `＋ ${dayLabel} に予定を追加` }).click();
  await expect(page.getByRole("heading", { name: "予定を追加" })).toBeVisible();
  if (item.startTime) await page.getByLabel("開始時刻").fill(item.startTime);
  if (item.endTime) await page.getByLabel("終了時刻").fill(item.endTime);
  await page.getByLabel("予定").fill(item.title);
  if (item.place) await page.getByLabel("行きたい場所から選ぶ").selectOption({ label: item.place });
  if (item.location) await page.getByLabel("場所", { exact: true }).fill(item.location);
  await page.getByRole("button", { name: "追加する" }).click();
  await expect(page.getByRole("heading", { name: "予定を追加" })).toBeHidden();
}

function daySection(page: Page, label: string) {
  return page.getByRole("region", { name: label });
}

test("create a trip, add places and a schedule, then browse it", async ({ page }) => {
  const title = `函館旅行 ${Date.now()}`;

  // 1. 旅行を作る
  await page.goto("/trips");
  await page.getByRole("link", { name: "＋ 旅行を作成" }).click();
  await page.getByLabel("タイトル").fill(title);
  await page.getByLabel("行き先").fill("北海道・函館");
  await page.getByLabel("開始日").fill("2026-11-03");
  await page.getByLabel("終了日").fill("2026-11-05");
  await page.getByLabel("メモ").fill("宿：函館駅前のホテル");
  await page.getByRole("button", { name: "作成する" }).click();

  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.getByText("11/3（火） 〜 11/5（木）・3日間")).toBeVisible();
  await expect(page.getByRole("link", { name: "Day 3" })).toBeVisible();

  // 2. 行きたい場所を登録する
  await page.getByRole("link", { name: "＋ 追加" }).click();
  await page.getByLabel("名前").fill("函館山");
  await page.getByText("絶対行きたい").click();
  await page.getByLabel("住所・エリア").fill("函館市元町");
  await page.getByLabel("URL").fill("https://334.co.jp/");
  await page.getByRole("button", { name: "追加する" }).click();

  const places = page.locator("#places");
  await expect(places.getByText("函館山")).toBeVisible();
  await expect(places.getByText("絶対行きたい")).toBeVisible();

  // 3. スケジュールを作る（入力順はバラバラ）
  const day2 = "11/4（水）";
  await addScheduleItem(page, day2, { startTime: "18:00", title: "夕食" });
  await addScheduleItem(page, day2, { title: "お土産を買う" });
  await addScheduleItem(page, day2, {
    startTime: "07:30",
    endTime: "09:00",
    title: "朝市で朝ごはん",
    location: "函館朝市",
  });
  await addScheduleItem(page, day2, { startTime: "16:30", title: "ロープウェイ", place: "函館山" });
  await addScheduleItem(page, "11/3（火）", { startTime: "12:00", title: "函館空港に到着" });

  // 4. 見る：日付 → 時刻順、時刻未定は最後
  await expect(
    daySection(page, day2).getByRole("listitem"),
  ).toHaveText([/朝市で朝ごはん/, /ロープウェイ/, /夕食/, /お土産を買う/]);
  await expect(daySection(page, day2).getByText("📍 函館山")).toBeVisible();
  await expect(daySection(page, "11/3（火）").getByRole("listitem")).toHaveText([/函館空港に到着/]);
  await expect(places.getByText("✓ 予定に入っています")).toBeVisible();

  // 予定を編集すると並び順も変わる
  await daySection(page, day2).getByRole("link", { name: /夕食/ }).click();
  await page.getByLabel("開始時刻").fill("06:30");
  await page.getByLabel("予定").fill("早朝散歩");
  await page.getByRole("button", { name: "保存する" }).click();
  await expect(daySection(page, day2).getByRole("listitem")).toHaveText([
    /早朝散歩/,
    /朝市で朝ごはん/,
    /ロープウェイ/,
    /お土産を買う/,
  ]);

  // 予定を削除する
  page.once("dialog", (dialog) => dialog.accept());
  await daySection(page, day2).getByRole("link", { name: /お土産を買う/ }).click();
  await page.getByRole("button", { name: "この予定を削除" }).click();
  await expect(daySection(page, day2).getByRole("listitem")).toHaveCount(3);

  // 行きたい場所を削除しても、その場所を使った予定は残る
  await places.getByRole("link", { name: /函館山/ }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "この場所を削除" }).click();
  await expect(places.getByText("行きたい場所はまだありません")).toBeVisible();
  await expect(daySection(page, day2).getByText("ロープウェイ")).toBeVisible();

  // 旅行を編集する
  await page.getByRole("link", { name: "編集" }).click();
  await page.getByLabel("行き先").fill("函館・大沼");
  await page.getByRole("button", { name: "保存する" }).click();
  await expect(page.getByText("函館・大沼")).toBeVisible();

  // 旅行を削除する
  await page.getByRole("link", { name: "編集" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "この旅行を削除" }).click();
  await expect(page).toHaveURL(/\/trips$/);
  await expect(page.getByText(title)).toHaveCount(0);
});

test("shows validation errors and keeps the input", async ({ page }) => {
  await page.goto("/trips/new");
  await page.getByLabel("行き先").fill("函館");
  await page.getByLabel("開始日").fill("2026-11-05");
  await page.getByLabel("終了日").fill("2026-11-03");
  await page.getByRole("button", { name: "作成する" }).click();

  await expect(page.getByText("タイトルを入力してください")).toBeVisible();
  await expect(page.getByText("終了日は開始日以降にしてください")).toBeVisible();
  await expect(page.getByLabel("行き先")).toHaveValue("函館");
  await expect(page).toHaveURL(/\/trips\/new$/);
});

test("unknown trip shows not found", async ({ page }) => {
  const response = await page.goto("/trips/00000000-0000-7000-8000-000000000000");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("ページが見つかりません")).toBeVisible();
});
