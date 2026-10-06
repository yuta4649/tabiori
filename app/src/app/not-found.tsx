import Link from "next/link";
import { buttonClass } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-lg font-semibold">ページが見つかりません</p>
      <Link href="/trips" className={buttonClass.secondary}>
        旅行一覧へ
      </Link>
    </main>
  );
}
