"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { fromDbDate, isDateString, toDbDate, toDbTime } from "@/lib/date";
import { readForm, toFormErrors, type FormState } from "@/lib/form";
import { editableTripWhere } from "@/server/authz";
import { getPrisma, isUuid } from "@/server/db";
import { requireUser } from "@/server/session";
import {
  scheduleItemFields,
  scheduleItemSchema,
  type ScheduleItemInput,
} from "./schema";

function dayPath(tripId: string, date: string) {
  return `/trips/${tripId}#day-${date}`;
}

function toData(input: ScheduleItemInput) {
  return {
    ...input,
    date: toDbDate(input.date),
    startTime: input.startTime ? toDbTime(input.startTime) : null,
    endTime: input.endTime ? toDbTime(input.endTime) : null,
  };
}

// 編集できる旅行か、旅行期間内の日付か、選ばれた行きたい場所がこの旅行のものかを確認する
async function validateAgainstTrip(
  userId: string,
  tripId: string,
  input: ScheduleItemInput,
  values: Record<string, string>,
): Promise<FormState | null> {
  const prisma = getPrisma();
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, ...editableTripWhere(userId) },
    select: { startDate: true, endDate: true },
  });
  if (!trip) notFound();

  const errors: Record<string, string[]> = {};
  if (
    input.date < fromDbDate(trip.startDate) ||
    input.date > fromDbDate(trip.endDate)
  ) {
    errors.date = ["旅行期間内の日付を選んでください"];
  }
  if (input.placeId) {
    const place = await prisma.place.findFirst({
      where: { id: input.placeId, tripId },
      select: { id: true },
    });
    if (!place) errors.placeId = ["行きたい場所が見つかりません"];
  }
  return Object.keys(errors).length > 0 ? { errors, values } : null;
}

export async function createScheduleItem(
  tripId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!isUuid(tripId)) notFound();
  const values = readForm(formData, scheduleItemFields);
  const parsed = scheduleItemSchema.safeParse(values);
  if (!parsed.success) return toFormErrors(parsed.error, values);

  const invalid = await validateAgainstTrip(user.id, tripId, parsed.data, values);
  if (invalid) return invalid;

  await getPrisma().scheduleItem.create({
    data: { ...toData(parsed.data), tripId },
  });

  revalidatePath(`/trips/${tripId}`);
  redirect(dayPath(tripId, parsed.data.date));
}

export async function updateScheduleItem(
  tripId: string,
  itemId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!isUuid(tripId) || !isUuid(itemId)) notFound();
  const values = readForm(formData, scheduleItemFields);
  const parsed = scheduleItemSchema.safeParse(values);
  if (!parsed.success) return toFormErrors(parsed.error, values);

  const invalid = await validateAgainstTrip(user.id, tripId, parsed.data, values);
  if (invalid) return invalid;

  const { count } = await getPrisma().scheduleItem.updateMany({
    where: { id: itemId, tripId, trip: editableTripWhere(user.id) },
    data: toData(parsed.data),
  });
  if (count === 0) notFound();

  revalidatePath(`/trips/${tripId}`);
  redirect(dayPath(tripId, parsed.data.date));
}

export async function deleteScheduleItem(
  tripId: string,
  itemId: string,
  date: string,
): Promise<void> {
  const user = await requireUser();
  if (!isUuid(tripId) || !isUuid(itemId)) notFound();
  const { count } = await getPrisma().scheduleItem.deleteMany({
    where: { id: itemId, tripId, trip: editableTripWhere(user.id) },
  });
  if (count === 0) notFound();

  revalidatePath(`/trips/${tripId}`);
  redirect(isDateString(date) ? dayPath(tripId, date) : `/trips/${tripId}`);
}
