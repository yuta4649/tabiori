import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { safeRedirectPath } from "@/lib/redirect";
import { getCurrentUser } from "@/server/session";

export const metadata: Metadata = { title: "ログイン | tabiori" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const redirectTo = safeRedirectPath(next);
  if (await getCurrentUser()) redirect(redirectTo);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">tabiori</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          旅の計画・当日の行動・思い出をまとめる旅のしおり
        </p>
      </div>
      <LoginForm redirectTo={redirectTo} />
    </main>
  );
}
