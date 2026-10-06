import type { Prisma } from "@/generated/prisma/client";

// 旅行データへのアクセス範囲を決める唯一の場所。
// Place / ScheduleItem は Trip を経由して判定するため、必ずこの条件を通すこと。
//
// 旅行の共有を追加するときは TripMember（tripId, userId, role）を作り、
// viewable / editable に `{ members: { some: { userId } } }` を OR で足す。

export function viewableTripWhere(userId: string): Prisma.TripWhereInput {
  return { ownerId: userId };
}

export function editableTripWhere(userId: string): Prisma.TripWhereInput {
  return { ownerId: userId };
}

// 旅行そのものの削除は、共有後も作成者だけに許可する想定
export function ownedTripWhere(userId: string): Prisma.TripWhereInput {
  return { ownerId: userId };
}
