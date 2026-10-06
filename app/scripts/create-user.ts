// ログインできるユーザーを作成する（画面からの新規登録は無効にしている）。
// 既に存在するメールアドレスを指定した場合は、パスワードを更新する。
//
//   pnpm user:create --email you@example.com --name あなた
//   （パスワードは対話入力。自動化する場合は環境変数 TABIORI_USER_PASSWORD で渡す）

import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { parseArgs } from "node:util";
import { z } from "zod";
import { getAuth } from "@/server/auth";
import { getPrisma } from "@/server/db";

const inputSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  name: z.string().trim().min(1).max(50),
  password: z.string().min(8).max(128),
});

async function promptPassword(): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _encoding, callback) {
      if (!muted) process.stdout.write(chunk);
      callback();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  const question = rl.question("パスワード（8文字以上）: ");
  muted = true;
  const password = await question;
  rl.close();
  process.stdout.write("\n");
  return password;
}

async function main() {
  const { values } = parseArgs({
    options: { email: { type: "string" }, name: { type: "string" } },
  });
  const password = process.env.TABIORI_USER_PASSWORD ?? (await promptPassword());
  const input = inputSchema.parse({
    email: values.email,
    name: values.name ?? values.email?.split("@")[0],
    password,
  });

  const ctx = await getAuth().$context;
  const hash = await ctx.password.hash(input.password);
  const existing = await ctx.internalAdapter.findUserByEmail(input.email);

  if (existing) {
    await ctx.internalAdapter.updatePassword(existing.user.id, hash);
    console.log(`Updated password: ${input.email}`);
    return;
  }

  const user = await ctx.internalAdapter.createUser(
    { email: input.email, name: input.name, emailVerified: true },
    { method: "admin" },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hash,
  });
  console.log(`Created user: ${input.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof z.ZodError ? z.prettifyError(error) : error);
    process.exitCode = 1;
  })
  .finally(() => getPrisma().$disconnect());
