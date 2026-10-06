import Link from "next/link";
import { buttonClass } from "./styles";

// フォーム下部のボタン。スマホでは親指が届く画面下に固定する。
export function FormFooter({
  cancelHref,
  submitLabel,
  pending,
}: {
  cancelHref: string;
  submitLabel: string;
  pending: boolean;
}) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-6 flex gap-3 border-t border-neutral-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <Link href={cancelHref} className={`${buttonClass.secondary} flex-1`}>
        キャンセル
      </Link>
      <button type="submit" disabled={pending} className={`${buttonClass.primary} flex-[2]`}>
        {pending ? "保存しています…" : submitLabel}
      </button>
    </div>
  );
}
