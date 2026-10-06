export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 起動時に環境変数を検証し、不備があればサーバーを起動させない。
    const { getEnv } = await import("@/lib/env");
    try {
      getEnv();
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
}
