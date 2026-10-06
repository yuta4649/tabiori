import { connection } from "next/server";
import { fromDbDate, fromDbTime } from "@/lib/date";
import { getPrisma, isUuid } from "@/server/db";
import type { ScheduleItemView } from "@/features/trip/types";

export async function getScheduleItem(
  tripId: string,
  itemId: string,
): Promise<ScheduleItemView | null> {
  await connection();
  if (!isUuid(tripId) || !isUuid(itemId)) return null;
  const item = await getPrisma().scheduleItem.findFirst({
    where: { id: itemId, tripId },
    include: { place: { select: { id: true, name: true } } },
  });
  if (!item) return null;
  return {
    id: item.id,
    date: fromDbDate(item.date),
    startTime: item.startTime ? fromDbTime(item.startTime) : null,
    endTime: item.endTime ? fromDbTime(item.endTime) : null,
    title: item.title,
    location: item.location,
    memo: item.memo,
    url: item.url,
    place: item.place,
  };
}
