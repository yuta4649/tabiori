import { nowIn } from "@/lib/date";
import type { TripView } from "./types";

export type TripStatus = "ongoing" | "upcoming" | "past";

// 旅行先のタイムゾーンでの「今日」を基準に判定する
export function tripStatus(
  trip: Pick<TripView, "startDate" | "endDate" | "timezone">,
  now: Date = new Date(),
): TripStatus {
  const today = nowIn(trip.timezone, now).date;
  if (today < trip.startDate) return "upcoming";
  if (today > trip.endDate) return "past";
  return "ongoing";
}
