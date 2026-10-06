"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { toDbDate } from "@/lib/date";
import { readForm, toFormErrors, type FormState } from "@/lib/form";
import { getPrisma, isRecordNotFound, isUuid } from "@/server/db";
import { tripFields, tripSchema, type TripInput } from "./schema";

function toData(input: TripInput) {
  return {
    ...input,
    startDate: toDbDate(input.startDate),
    endDate: toDbDate(input.endDate),
  };
}

export async function createTrip(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = readForm(formData, tripFields);
  const parsed = tripSchema.safeParse(values);
  if (!parsed.success) return toFormErrors(parsed.error, values);

  const trip = await getPrisma().trip.create({ data: toData(parsed.data) });

  revalidatePath("/trips");
  redirect(`/trips/${trip.id}`);
}

export async function updateTrip(
  tripId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isUuid(tripId)) notFound();
  const values = readForm(formData, tripFields);
  const parsed = tripSchema.safeParse(values);
  if (!parsed.success) return toFormErrors(parsed.error, values);

  try {
    await getPrisma().trip.update({
      where: { id: tripId },
      data: toData(parsed.data),
    });
  } catch (error) {
    if (isRecordNotFound(error)) notFound();
    throw error;
  }

  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

export async function deleteTrip(tripId: string): Promise<void> {
  if (!isUuid(tripId)) notFound();
  // 行きたい場所と予定は外部キーの ON DELETE CASCADE で一緒に削除される
  await getPrisma().trip.deleteMany({ where: { id: tripId } });

  revalidatePath("/trips");
  redirect("/trips");
}
