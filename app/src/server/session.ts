import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAuth } from "./auth";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

// 1リクエスト内では一度だけセッションを確認する
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // headers() を先に呼ぶ。ビルド時の事前描画はここで止まり、認証設定（環境変数）を読まずに済む
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
});

// データの取得・更新の入口で必ず呼ぶ。proxy.ts のチェックはあくまで画面遷移用の簡易判定。
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
