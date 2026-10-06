import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteForm } from "@/components/ui/delete-form";
import { PageHeader } from "@/components/ui/page-header";
import { deletePlace, updatePlace } from "@/features/place/actions";
import { PlaceForm } from "@/features/place/components/place-form";
import { getPlace } from "@/features/place/queries";

export const metadata: Metadata = { title: "行きたい場所を編集 | tabiori" };

export default async function EditPlacePage({
  params,
}: PageProps<"/trips/[tripId]/places/[placeId]/edit">) {
  const { tripId, placeId } = await params;
  const place = await getPlace(tripId, placeId);
  if (!place) notFound();

  const backHref = `/trips/${tripId}#places`;
  return (
    <>
      <PageHeader backHref={backHref} backLabel="しおり" title="行きたい場所を編集" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6 pb-10">
        <PlaceForm
          action={updatePlace.bind(null, tripId, place.id)}
          place={place}
          cancelHref={backHref}
          submitLabel="保存する"
        />
        <div className="mt-10">
          <DeleteForm
            action={deletePlace.bind(null, tripId, place.id)}
            label="この場所を削除"
            confirmMessage={
              place.scheduledCount > 0
                ? `「${place.name}」を削除しますか？この場所を使っている予定は残ります。`
                : `「${place.name}」を削除しますか？`
            }
          />
        </div>
      </main>
    </>
  );
}
