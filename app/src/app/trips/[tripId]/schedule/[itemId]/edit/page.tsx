import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteForm } from "@/components/ui/delete-form";
import { PageHeader } from "@/components/ui/page-header";
import { listPlaceOptions } from "@/features/place/queries";
import { deleteScheduleItem, updateScheduleItem } from "@/features/schedule/actions";
import { ScheduleItemForm } from "@/features/schedule/components/schedule-item-form";
import { getScheduleItem } from "@/features/schedule/queries";
import { getTrip } from "@/features/trip/queries";

export const metadata: Metadata = { title: "予定を編集 | tabiori" };

export default async function EditScheduleItemPage({
  params,
}: PageProps<"/trips/[tripId]/schedule/[itemId]/edit">) {
  const { tripId, itemId } = await params;
  const [trip, item, places] = await Promise.all([
    getTrip(tripId),
    getScheduleItem(tripId, itemId),
    listPlaceOptions(tripId),
  ]);
  if (!trip || !item) notFound();

  const backHref = `/trips/${trip.id}#day-${item.date}`;
  return (
    <>
      <PageHeader backHref={backHref} backLabel="しおり" title="予定を編集" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6 pb-10">
        <ScheduleItemForm
          action={updateScheduleItem.bind(null, trip.id, item.id)}
          trip={trip}
          places={places}
          defaults={{ ...item, placeId: item.place?.id ?? null }}
          cancelHref={backHref}
          submitLabel="保存する"
        />
        <div className="mt-10">
          <DeleteForm
            action={deleteScheduleItem.bind(null, trip.id, item.id, item.date)}
            label="この予定を削除"
            confirmMessage={`「${item.title}」を削除しますか？`}
          />
        </div>
      </main>
    </>
  );
}
