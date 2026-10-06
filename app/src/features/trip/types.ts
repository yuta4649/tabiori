import type { PlacePriority } from "@/generated/prisma/enums";
import type { DateString, TimeString } from "@/lib/date";

export type TripView = {
  id: string;
  title: string;
  destination: string;
  startDate: DateString;
  endDate: DateString;
  timezone: string;
  memo: string | null;
};

export type TripSummary = TripView & {
  placeCount: number;
  scheduleItemCount: number;
};

export type PlaceView = {
  id: string;
  name: string;
  address: string | null;
  url: string | null;
  memo: string | null;
  priority: PlacePriority;
  scheduledCount: number;
};

export type ScheduleItemView = {
  id: string;
  date: DateString;
  startTime: TimeString | null;
  endTime: TimeString | null;
  title: string;
  location: string | null;
  memo: string | null;
  url: string | null;
  place: { id: string; name: string } | null;
};

export type TripDetail = TripView & {
  places: PlaceView[];
  scheduleItems: ScheduleItemView[];
};
