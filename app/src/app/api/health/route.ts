// ALB のヘルスチェック用。DB には触れない（Aurora の自動一時停止を妨げないため）。
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" });
}
