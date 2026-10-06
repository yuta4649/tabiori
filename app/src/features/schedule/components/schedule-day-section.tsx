import Link from "next/link";
import { ExternalLink } from "@/components/ui/external-link";
import { formatDate } from "@/lib/date";
import type { ScheduleItemView } from "@/features/trip/types";
import type { ScheduleDay } from "../group";

export function ScheduleDaySection({
  tripId,
  day,
  isToday,
  nextItemId,
}: {
  tripId: string;
  day: ScheduleDay<ScheduleItemView>;
  isToday: boolean;
  nextItemId: string | null;
}) {
  return (
    <section
      id={`day-${day.date}`}
      aria-label={formatDate(day.date)}
      className="scroll-mt-28"
    >
      <h3 className="flex items-baseline gap-2 border-b border-neutral-200 pb-2 dark:border-neutral-800">
        {day.dayNumber !== null ? (
          <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
            Day {day.dayNumber}
          </span>
        ) : (
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
            期間外
          </span>
        )}
        <span className="text-lg font-semibold">{formatDate(day.date)}</span>
        {isToday ? (
          <span className="rounded-full bg-teal-700 px-2 py-0.5 text-xs font-semibold text-white dark:bg-teal-600">
            今日
          </span>
        ) : null}
      </h3>

      {day.items.length === 0 ? (
        <p className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
          予定はまだありません
        </p>
      ) : (
        <ol className="divide-y divide-neutral-100 dark:divide-neutral-900">
          {day.items.map((item) => (
            <li
              key={item.id}
              className={
                item.id === nextItemId
                  ? "-mx-2 rounded-lg bg-teal-50 px-2 dark:bg-teal-950/50"
                  : undefined
              }
            >
              <Link
                href={`/trips/${tripId}/schedule/${item.id}/edit`}
                className="flex gap-3 py-3"
              >
                <div className="w-14 shrink-0 text-right tabular-nums">
                  {item.startTime ? (
                    <>
                      <div className="font-semibold">{item.startTime}</div>
                      {item.endTime ? (
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          〜{item.endTime}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      時刻未定
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold leading-snug">
                    {item.id === nextItemId ? (
                      <span className="mr-1.5 rounded bg-teal-700 px-1.5 py-0.5 align-[1px] text-[11px] font-semibold text-white dark:bg-teal-600">
                        次
                      </span>
                    ) : null}
                    {item.title}
                  </div>
                  {item.place || item.location ? (
                    <div className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                      📍 {[item.place?.name, item.location].filter(Boolean).join(" · ")}
                    </div>
                  ) : null}
                  {item.memo ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
                      {item.memo}
                    </p>
                  ) : null}
                </div>
              </Link>
              {item.url ? (
                <div className="-mt-2 pb-2 pl-[4.25rem]">
                  <ExternalLink href={item.url} />
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      {day.dayNumber !== null ? (
        <Link
          href={`/trips/${tripId}/schedule/new?date=${day.date}`}
          className="mt-1 flex min-h-11 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
        >
          ＋ {formatDate(day.date)} に予定を追加
        </Link>
      ) : null}
    </section>
  );
}
