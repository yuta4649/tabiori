import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  backHref,
  backLabel,
  title,
  action,
}: {
  backHref?: string;
  backLabel?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex h-14 max-w-lg items-center gap-2 px-4">
        {backHref ? (
          <Link
            href={backHref}
            className="-ml-2 flex min-h-11 items-center px-2 text-sm text-teal-700 dark:text-teal-400"
          >
            ← {backLabel ?? "戻る"}
          </Link>
        ) : null}
        {title ? (
          <h1 className="min-w-0 flex-1 truncate text-base font-semibold">
            {title}
          </h1>
        ) : (
          <div className="flex-1" />
        )}
        {action}
      </div>
    </header>
  );
}
