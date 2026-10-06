import { expect, test } from "@playwright/test";

test("health check returns ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});

test("database health check reaches PostgreSQL", async ({ request }) => {
  const response = await request.get("/api/health/db");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok", database: "ok" });
});

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "tabiori" })).toBeVisible();
});
