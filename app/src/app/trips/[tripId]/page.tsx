import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClass } from "@/components/ui/styles";
import { PlaceList } from "@/features/place/components/place-list";
import { ScheduleDaySection } from "@/features/schedule/components/schedule-day-section";
import { findNextItem, groupScheduleByDay } from "@/features/schedule/group";
import { getTripDetail } from "@/features/trip/queries";
import { timeZoneLabel } from "@/features/trip/schema";
import { dayIndex, formatDate, formatDateRange, nowIn } from "@/lib/date";

export async function generateMetadata({
  params,
}: PageProps<"/trips/[tripId]">): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await getTripDetail(tripId);
  return { title: trip ? `${trip.title} | tabiori` : "tabiori" };
}

export default async function TripPage({ params }: PageProps<"/trips/[tripId]">) {
  const { tripId } = await params;
  const trip = await getTripDetail(tripId);
  if (!trip) notFound();

  const now = nowIn(trip.timezone);
  const days = groupScheduleByDay(trip, trip.scheduleItems);
  const today = days.find((day) => day.date === now.date && day.dayNumber !== null);
  const nextItem = today ? findNextItem(today.items, now.time) : null;

  return (
    <>
      <PageHeader
        backHref="/trips"
        backLabel="旅行一覧"
        action={
          <Link href={`/trips/${trip.id}/edit`} className={buttonClass.secondary}>
            編集
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-lg flex-1 pb-16">
        {/* 1. 旅行概要 */}
        <section aria-labelledby="trip-title" className="space-y-1 px-4 pt-5 pb-4">
          <h1 id="trip-title" className="text-2xl font-bold leading-tight">
            {trip.title}
          </h1>
          <p className="text-neutral-700 dark:text-neutral-300">{trip.destination}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {formatDateRange(trip.startDate, trip.endDate)}・
            {dayIndex(trip.startDate, trip.endDate)}日間
            {trip.timezone !== "Asia/Tokyo" ? `・${timeZoneLabel(trip.timezone)}時間` : null}
          </p>
          {trip.memo ? (
            <p className="whitespace-pre-wrap pt-2 text-sm text-neutral-700 dark:text-neutral-300">
              {trip.memo}
            </p>
          ) : null}
        </section>

        {today ? (
          <section
            aria-label="今日"
            className="mx-4 mb-4 rounded-xl bg-teal-700 px-4 py-3 text-white dark:bg-teal-800"
          >
            <div className="text-sm font-medium opacity-90">
              今日は Day {today.dayNumber}・{formatDate(today.date)}
            </div>
            {nextItem ? (
              <Link href={`#day-${today.date}`} className="mt-1 block">
                <span className="text-xs opacity-80">次の予定</span>
                <div className="text-lg font-bold leading-snug">
                  <span className="tabular-nums">{nextItem.startTime}</span> {nextItem.title}
                </div>
                {nextItem.place || nextItem.location ? (
                  <div className="text-sm opacity-90">
                    📍 {[nextItem.place?.name, nextItem.location].filter(Boolean).join(" · ")}
                  </div>
                ) : null}
              </Link>
            ) : (
              <Link href={`#day-${today.date}`} className="mt-1 block font-semibold">
                今日の予定を見る ↓
              </Link>
            )}
          </section>
        ) : null}

        {/* セクション間の移動。旅行中に片手で切り替えられるよう上部に固定する */}
        <nav
          aria-label="セクション"
          className="sticky top-14 z-10 border-y border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"
        >
          <ul className="flex gap-2 overflow-x-auto px-4 py-2 text-sm whitespace-nowrap">
            {days
              .filter((day) => day.dayNumber !== null)
              .map((day) => (
                <li key={day.date}>
                  <a
                    href={`#day-${day.date}`}
                    className={`flex min-h-9 items-center rounded-full border px-3 ${
                      day.date === today?.date
                        ? "border-teal-700 bg-teal-700 font-semibold text-white dark:border-teal-600 dark:bg-teal-600"
                        : "border-neutral-300 dark:border-neutral-700"
                    }`}
                  >
                    Day {day.dayNumber}
                  </a>
                </li>
              ))}
            <li>
              <a
                href="#places"
                className="flex min-h-9 items-center rounded-full border border-neutral-300 px-3 dark:border-neutral-700"
              >
                行きたい場所 {trip.places.length}
              </a>
            </li>
          </ul>
        </nav>

        {/* 2. 日付ごとのスケジュール */}
        <section aria-labelledby="schedule-heading" className="space-y-8 px-4 pt-6">
          <h2 id="schedule-heading" className="sr-only">
            スケジュール
          </h2>
          {days.map((day) => (
            <ScheduleDaySection
              key={day.date}
              tripId={trip.id}
              day={day}
              isToday={day.date === today?.date}
              nextItemId={day.date === today?.date ? (nextItem?.id ?? null) : null}
            />
          ))}
        </section>

        {/* 3. 行きたい場所 */}
        <section
          id="places"
          aria-labelledby="places-heading"
          className="scroll-mt-28 px-4 pt-10"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 id="places-heading" className="text-lg font-semibold">
              行きたい場所
            </h2>
            <Link href={`/trips/${trip.id}/places/new`} className={buttonClass.secondary}>
              ＋ 追加
            </Link>
          </div>
          <PlaceList tripId={trip.id} places={trip.places} />
        </section>
      </main>
    </>
  );
}
