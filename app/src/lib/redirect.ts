const DEFAULT_PATH = "/trips";

// ログイン後の遷移先。外部サイトへのリダイレクト（オープンリダイレクト）を防ぐため、
// 同一オリジン内のパスだけを許可する。
export function safeRedirectPath(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_PATH;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_PATH;
  }
  if (value === "/login" || value.startsWith("/login?") || value.startsWith("/api/")) {
    return DEFAULT_PATH;
  }
  return value;
}
