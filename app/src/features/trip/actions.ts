"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { toDbDate } from "@/lib/date";
import { readForm, toFormErrors, type FormState } from "@/lib/form";
import { editableTripWhere, ownedTripWhere } from "@/server/authz";
import { getPrisma, isUuid } from "@/server/db";
import { requireUser } from "@/server/session";
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
  const user = await requireUser();
  const values = readForm(formData, tripFields);
  const parsed = tripSchema.safeParse(values);
  if (!parsed.success) return toFormErrors(parsed.error, values);

  const trip = await getPrisma().trip.create({
    data: { ...toData(parsed.data), ownerId: user.id },
  });

  revalidatePath("/trips");
  redirect(`/trips/${trip.id}`);
}

export async function updateTrip(
  tripId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!isUuid(tripId)) notFound();
  const values = readForm(formData, tripFields);
  const parsed = tripSchema.safeParse(values);
  if (!parsed.success) return toFormErrors(parsed.error, values);

  // 他人の旅行は条件に一致しないため 0 件更新になる
  const { count } = await getPrisma().trip.updateMany({
    where: { id: tripId, ...editableTripWhere(user.id) },
    data: toData(parsed.data),
  });
  if (count === 0) notFound();

  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

export async function deleteTrip(tripId: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(tripId)) notFound();
  // 行きたい場所と予定は外部キーの ON DELETE CASCADE で一緒に削除される
  const { count } = await getPrisma().trip.deleteMany({
    where: { id: tripId, ...ownedTripWhere(user.id) },
  });
  if (count === 0) notFound();

  revalidatePath("/trips");
  redirect("/trips");
}
