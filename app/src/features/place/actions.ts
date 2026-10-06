"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { readForm, toFormErrors, type FormState } from "@/lib/form";
import { getPrisma, isRecordNotFound, isUuid } from "@/server/db";
import { placeFields, placeSchema } from "./schema";

function placesPath(tripId: string) {
  return `/trips/${tripId}#places`;
}

export async function createPlace(
  tripId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isUuid(tripId)) notFound();
  const values = readForm(formData, placeFields);
  const parsed = placeSchema.safeParse(values);
  if (!parsed.success) return toFormErrors(parsed.error, values);

  const prisma = getPrisma();
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true },
  });
  if (!trip) notFound();

  await prisma.place.create({ data: { ...parsed.data, tripId } });

  revalidatePath(`/trips/${tripId}`);
  redirect(placesPath(tripId));
}

export async function updatePlace(
  tripId: string,
  placeId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isUuid(tripId) || !isUuid(placeId)) notFound();
  const values = readForm(formData, placeFields);
  const parsed = placeSchema.safeParse(values);
  if (!parsed.success) return toFormErrors(parsed.error, values);

  try {
    await getPrisma().place.update({
      where: { id: placeId, tripId },
      data: parsed.data,
    });
  } catch (error) {
    if (isRecordNotFound(error)) notFound();
    throw error;
  }

  revalidatePath(`/trips/${tripId}`);
  redirect(placesPath(tripId));
}

export async function deletePlace(
  tripId: string,
  placeId: string,
): Promise<void> {
  if (!isUuid(tripId) || !isUuid(placeId)) notFound();
  // この場所を参照している予定は残り、参照だけが外れる（ON DELETE SET NULL）
  await getPrisma().place.deleteMany({ where: { id: placeId, tripId } });

  revalidatePath(`/trips/${tripId}`);
  redirect(placesPath(tripId));
}
