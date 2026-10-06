import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { createPlace } from "@/features/place/actions";
import { PlaceForm } from "@/features/place/components/place-form";
import { getTrip } from "@/features/trip/queries";

export const metadata: Metadata = { title: "行きたい場所を追加 | tabiori" };

export default async function NewPlacePage({
  params,
}: PageProps<"/trips/[tripId]/places/new">) {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  if (!trip) notFound();

  const backHref = `/trips/${trip.id}#places`;
  return (
    <>
      <PageHeader backHref={backHref} backLabel="しおり" title="行きたい場所を追加" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6">
        <PlaceForm
          action={createPlace.bind(null, trip.id)}
          cancelHref={backHref}
          submitLabel="追加する"
        />
      </main>
    </>
  );
}
