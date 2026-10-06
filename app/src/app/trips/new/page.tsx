import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { createTrip } from "@/features/trip/actions";
import { TripForm } from "@/features/trip/components/trip-form";

export const metadata: Metadata = { title: "旅行を作成 | tabiori" };

export default function NewTripPage() {
  return (
    <>
      <PageHeader backHref="/trips" backLabel="旅行一覧" title="旅行を作成" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6">
        <TripForm action={createTrip} cancelHref="/trips" submitLabel="作成する" />
      </main>
    </>
  );
}
