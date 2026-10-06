import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { listPlaceOptions } from "@/features/place/queries";
import { createScheduleItem } from "@/features/schedule/actions";
import { ScheduleItemForm } from "@/features/schedule/components/schedule-item-form";
import { getTrip } from "@/features/trip/queries";
import { isDateString, nowIn } from "@/lib/date";

export const metadata: Metadata = { title: "予定を追加 | tabiori" };

export default async function NewScheduleItemPage({
  params,
  searchParams,
}: PageProps<"/trips/[tripId]/schedule/new">) {
  const { tripId } = await params;
  const { date } = await searchParams;
  const [trip, places] = await Promise.all([getTrip(tripId), listPlaceOptions(tripId)]);
  if (!trip) notFound();

  const inTrip = (value: string) =>
    isDateString(value) && value >= trip.startDate && value <= trip.endDate;
  // 指定がなければ、旅行中は今日、それ以外は初日を初期値にする
  const today = nowIn(trip.timezone).date;
  const initialDate =
    typeof date === "string" && inTrip(date)
      ? date
      : inTrip(today)
        ? today
        : trip.startDate;
  const backHref = `/trips/${trip.id}#day-${initialDate}`;

  return (
    <>
      <PageHeader backHref={backHref} backLabel="しおり" title="予定を追加" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6">
        <ScheduleItemForm
          action={createScheduleItem.bind(null, trip.id)}
          trip={trip}
          places={places}
          defaults={{ date: initialDate }}
          cancelHref={backHref}
          submitLabel="追加する"
        />
      </main>
    </>
  );
}
