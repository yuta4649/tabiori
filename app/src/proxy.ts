import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// セッション Cookie の有無だけを見て、未ログインならログイン画面へ送る（画面遷移用の簡易判定）。
// 実際の認証・認可はデータアクセス層（requireUser と authz.ts）で必ず行う。
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  const { pathname, search } = request.nextUrl;
  if (pathname !== "/") loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!login|api/auth|api/health|_next/static|_next/image|favicon.ico).*)",
  ],
};
