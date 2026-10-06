"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        router.replace("/login");
        router.refresh();
      }}
      className="min-h-11 px-2 text-sm text-teal-700 underline underline-offset-2 disabled:opacity-50 dark:text-teal-400"
    >
      {pending ? "ログアウトしています…" : "ログアウト"}
    </button>
  );
}
