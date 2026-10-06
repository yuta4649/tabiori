"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { readForm, toFormErrors, type FormState } from "@/lib/form";
import { editableTripWhere } from "@/server/authz";
import { getPrisma, isUuid } from "@/server/db";
import { requireUser } from "@/server/session";
import { placeFields, placeSchema } from "./schema";

function placesPath(tripId: string) {
  return `/trips/${tripId}#places`;
}

export async function createPlace(
  tripId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!isUuid(tripId)) notFound();
  const values = readForm(formData, placeFields);
  const parsed = placeSchema.safeParse(values);
  if (!parsed.success) return toFormErrors(parsed.error, values);

  const prisma = getPrisma();
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, ...editableTripWhere(user.id) },
    select: { id: true },
  });
  if (!trip) notFound();

  await prisma.place.create({ data: { ...parsed.data, tripId: trip.id } });

  revalidatePath(`/trips/${tripId}`);
  redirect(placesPath(tripId));
}

export async function updatePlace(
  tripId: string,
  placeId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!isUuid(tripId) || !isUuid(placeId)) notFound();
  const values = readForm(formData, placeFields);
  const parsed = placeSchema.safeParse(values);
  if (!parsed.success) return toFormErrors(parsed.error, values);

  const { count } = await getPrisma().place.updateMany({
    where: { id: placeId, tripId, trip: editableTripWhere(user.id) },
    data: parsed.data,
  });
  if (count === 0) notFound();

  revalidatePath(`/trips/${tripId}`);
  redirect(placesPath(tripId));
}

export async function deletePlace(
  tripId: string,
  placeId: string,
): Promise<void> {
  const user = await requireUser();
  if (!isUuid(tripId) || !isUuid(placeId)) notFound();
  // この場所を参照している予定は残り、参照だけが外れる（ON DELETE SET NULL）
  const { count } = await getPrisma().place.deleteMany({
    where: { id: placeId, tripId, trip: editableTripWhere(user.id) },
  });
  if (count === 0) notFound();

  revalidatePath(`/trips/${tripId}`);
  redirect(placesPath(tripId));
}
