import { connection } from "next/server";
import { fromDbDate, fromDbTime } from "@/lib/date";
import { getPrisma, isUuid } from "@/server/db";
import type { TripDetail, TripSummary, TripView } from "./types";

type TripRow = {
  id: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  memo: string | null;
};

function toTripView(trip: TripRow): TripView {
  return {
    id: trip.id,
    title: trip.title,
    destination: trip.destination,
    startDate: fromDbDate(trip.startDate),
    endDate: fromDbDate(trip.endDate),
    timezone: trip.timezone,
    memo: trip.memo,
  };
}

export async function listTrips(): Promise<TripSummary[]> {
  await connection();
  const trips = await getPrisma().trip.findMany({
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { places: true, scheduleItems: true } } },
  });
  return trips.map((trip) => ({
    ...toTripView(trip),
    placeCount: trip._count.places,
    scheduleItemCount: trip._count.scheduleItems,
  }));
}

export async function getTrip(tripId: string): Promise<TripView | null> {
  await connection();
  if (!isUuid(tripId)) return null;
  const trip = await getPrisma().trip.findUnique({ where: { id: tripId } });
  return trip ? toTripView(trip) : null;
}

export async function getTripDetail(
  tripId: string,
): Promise<TripDetail | null> {
  await connection();
  if (!isUuid(tripId)) return null;
  const trip = await getPrisma().trip.findUnique({
    where: { id: tripId },
    include: {
      // PostgreSQL の enum は定義順（MUST → WANT → MAYBE）で並ぶ
      places: {
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
        include: { _count: { select: { scheduleItems: true } } },
      },
      scheduleItems: {
        orderBy: [
          { date: "asc" },
          { startTime: { sort: "asc", nulls: "last" } },
          { createdAt: "asc" },
        ],
        include: { place: { select: { id: true, name: true } } },
      },
    },
  });
  if (!trip) return null;

  return {
    ...toTripView(trip),
    places: trip.places.map((place) => ({
      id: place.id,
      name: place.name,
      address: place.address,
      url: place.url,
      memo: place.memo,
      priority: place.priority,
      scheduledCount: place._count.scheduleItems,
    })),
    scheduleItems: trip.scheduleItems.map((item) => ({
      id: item.id,
      date: fromDbDate(item.date),
      startTime: item.startTime ? fromDbTime(item.startTime) : null,
      endTime: item.endTime ? fromDbTime(item.endTime) : null,
      title: item.title,
      location: item.location,
      memo: item.memo,
      url: item.url,
      place: item.place,
    })),
  };
}
