import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getEnv } from "@/lib/env";
import { getPrisma } from "./db";

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function createAuth() {
  const env = getEnv();
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS,
    database: prismaAdapter(getPrisma(), { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      // 利用者は自分と旅行相手だけなので、画面からの新規登録は受け付けない。
      // アカウントは `pnpm user:create` で作成する。
      disableSignUp: true,
    },
    session: {
      // 旅行中にログアウトされないよう長めにする（利用があれば自動で延長される）
      expiresIn: THIRTY_DAYS_IN_SECONDS,
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

let auth: Auth | undefined;

// 環境変数の検証をビルド時に走らせないよう、初回利用時に生成する
export function getAuth(): Auth {
  auth ??= createAuth();
  return auth;
}
