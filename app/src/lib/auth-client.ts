import { createAuthClient } from "better-auth/react";

// ログイン・ログアウトは Better Auth のエンドポイント（/api/auth/*）を経由させる。
// エンドポイント側のレート制限とオリジン検証を効かせるため。
export const authClient = createAuthClient();
