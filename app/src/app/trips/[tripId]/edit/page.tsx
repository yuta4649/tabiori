import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteForm } from "@/components/ui/delete-form";
import { PageHeader } from "@/components/ui/page-header";
import { deleteTrip, updateTrip } from "@/features/trip/actions";
import { TripForm } from "@/features/trip/components/trip-form";
import { getTrip } from "@/features/trip/queries";

export const metadata: Metadata = { title: "旅行を編集 | tabiori" };

export default async function EditTripPage({
  params,
}: PageProps<"/trips/[tripId]/edit">) {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  if (!trip) notFound();

  const tripPath = `/trips/${trip.id}`;
  return (
    <>
      <PageHeader backHref={tripPath} backLabel="しおり" title="旅行を編集" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6 pb-10">
        <TripForm
          action={updateTrip.bind(null, trip.id)}
          trip={trip}
          cancelHref={tripPath}
          submitLabel="保存する"
        />
        <div className="mt-10">
          <DeleteForm
            action={deleteTrip.bind(null, trip.id)}
            label="この旅行を削除"
            confirmMessage={`「${trip.title}」を削除しますか？予定と行きたい場所もすべて削除されます。`}
          />
        </div>
      </main>
    </>
  );
}
