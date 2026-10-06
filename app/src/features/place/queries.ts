import { connection } from "next/server";
import { getPrisma, isUuid } from "@/server/db";
import type { PlaceView } from "@/features/trip/types";

export async function getPlace(
  tripId: string,
  placeId: string,
): Promise<PlaceView | null> {
  await connection();
  if (!isUuid(tripId) || !isUuid(placeId)) return null;
  const place = await getPrisma().place.findFirst({
    where: { id: placeId, tripId },
    include: { _count: { select: { scheduleItems: true } } },
  });
  if (!place) return null;
  return {
    id: place.id,
    name: place.name,
    address: place.address,
    url: place.url,
    memo: place.memo,
    priority: place.priority,
    scheduledCount: place._count.scheduleItems,
  };
}

// 予定フォームの「行きたい場所から選ぶ」用
export async function listPlaceOptions(
  tripId: string,
): Promise<{ id: string; name: string }[]> {
  await connection();
  if (!isUuid(tripId)) return [];
  return getPrisma().place.findMany({
    where: { tripId },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true },
  });
}
