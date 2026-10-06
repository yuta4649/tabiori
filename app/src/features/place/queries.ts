import { viewableTripWhere } from "@/server/authz";
import { getPrisma, isUuid } from "@/server/db";
import { requireUser } from "@/server/session";
import type { PlaceView } from "@/features/trip/types";

export async function getPlace(
  tripId: string,
  placeId: string,
): Promise<PlaceView | null> {
  const user = await requireUser();
  if (!isUuid(tripId) || !isUuid(placeId)) return null;
  const place = await getPrisma().place.findFirst({
    where: { id: placeId, tripId, trip: viewableTripWhere(user.id) },
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
  const user = await requireUser();
  if (!isUuid(tripId)) return [];
  return getPrisma().place.findMany({
    where: { tripId, trip: viewableTripWhere(user.id) },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true },
  });
}
