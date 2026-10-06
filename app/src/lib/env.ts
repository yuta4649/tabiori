import { z } from "zod";

const commaSeparatedOrigins = z
  .string()
  .optional()
  .transform((value) =>
    (value ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.url({ protocol: /^https?$/ })));

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  // `openssl rand -base64 32` などで生成する。セッションの署名に使う
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  // アプリの公開 URL（例: http://localhost:3000）
  BETTER_AUTH_URL: z.url({ protocol: /^https?$/ }),
  // BETTER_AUTH_URL 以外からログインを許可するオリジン（例: スマホ実機確認用の http://192.168.0.10:3000）
  BETTER_AUTH_TRUSTED_ORIGINS: commaSeparatedOrigins,
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

let cached: Env | undefined;

// ビルド時には評価されないよう、実行時に初めて参照されたタイミングで検証する。
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
