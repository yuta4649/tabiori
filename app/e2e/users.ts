// E2E 用のテストユーザー。auth.setup.ts で作成し、ログイン状態を保存する。
export const E2E_PASSWORD = "e2e-password-1234";

export const USERS = {
  alice: {
    email: "e2e-alice@tabiori.test",
    name: "E2E Alice",
    storageState: "playwright/.auth/alice.json",
  },
  bob: {
    email: "e2e-bob@tabiori.test",
    name: "E2E Bob",
    storageState: "playwright/.auth/bob.json",
  },
} as const;
