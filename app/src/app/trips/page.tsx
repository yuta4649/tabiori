import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClass } from "@/components/ui/styles";
import { listTrips } from "@/features/trip/queries";
import { tripStatus, type TripStatus } from "@/features/trip/status";
import type { TripSummary } from "@/features/trip/types";
import { dayIndex, formatDateRange } from "@/lib/date";

export const metadata: Metadata = { title: "旅行一覧 | tabiori" };

const SECTIONS: { status: TripStatus; title: string }[] = [
  { status: "ongoing", title: "旅行中" },
  { status: "upcoming", title: "これからの旅行" },
  { status: "past", title: "過去の旅行" },
];

export default async function TripsPage() {
  const trips = await listTrips();
  const now = new Date();
  const grouped = Map.groupBy(trips, (trip) => tripStatus(trip, now));
  // これからの旅行は近い順に並べる（取得時は開始日の新しい順）
  grouped.get("upcoming")?.reverse();

  return (
    <>
      <PageHeader
        title="tabiori"
        action={
          <Link href="/trips/new" className={buttonClass.primary}>
            ＋ 旅行を作成
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-8 px-4 py-6">
        {trips.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              まだ旅行がありません
            </p>
            <Link href="/trips/new" className={`${buttonClass.primary} mt-4`}>
              最初の旅行を作成する
            </Link>
          </div>
        ) : (
          SECTIONS.map(({ status, title }) => {
            const items = grouped.get(status);
            if (!items?.length) return null;
            return (
              <section key={status} aria-labelledby={`trips-${status}`}>
                <h2
                  id={`trips-${status}`}
                  className="mb-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400"
                >
                  {title}
                </h2>
                <ul className="space-y-3">
                  {items.map((trip) => (
                    <li key={trip.id}>
                      <TripCard trip={trip} ongoing={status === "ongoing"} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </main>
    </>
  );
}

function TripCard({ trip, ongoing }: { trip: TripSummary; ongoing: boolean }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className={`block rounded-xl border bg-white px-4 py-3 dark:bg-neutral-900 ${
        ongoing
          ? "border-teal-600 ring-2 ring-teal-600/20"
          : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="text-lg font-semibold leading-snug">{trip.title}</div>
      <div className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
        {trip.destination}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
        <span>
          {formatDateRange(trip.startDate, trip.endDate)}・
          {dayIndex(trip.startDate, trip.endDate)}日間
        </span>
        <span>予定 {trip.scheduleItemCount}</span>
        <span>行きたい場所 {trip.placeCount}</span>
      </div>
    </Link>
  );
}
