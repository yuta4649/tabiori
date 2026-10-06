import { dayIndex, eachDate, type DateString, type TimeString } from "@/lib/date";

type Schedulable = {
  date: DateString;
  startTime: TimeString | null;
};

export type ScheduleDay<T> = {
  date: DateString;
  // 旅行期間外の日付は null
  dayNumber: number | null;
  items: T[];
};

// 時刻順。時刻未定の予定はその日の最後に置く（同条件では元の順序を保つ）
export function compareByTime(a: Schedulable, b: Schedulable): number {
  if (a.startTime === b.startTime) return 0;
  if (a.startTime === null) return 1;
  if (b.startTime === null) return -1;
  return a.startTime < b.startTime ? -1 : 1;
}

// 旅行期間の全日付（予定がない日も含む）と、期間外にはみ出した予定の日付をまとめる
export function groupScheduleByDay<T extends Schedulable>(
  trip: { startDate: DateString; endDate: DateString },
  items: T[],
): ScheduleDay<T>[] {
  const days = new Map<DateString, T[]>();
  for (const date of eachDate(trip.startDate, trip.endDate)) {
    days.set(date, []);
  }
  for (const item of items) {
    const list = days.get(item.date) ?? [];
    list.push(item);
    days.set(item.date, list);
  }

  return [...days.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, dayItems]) => ({
      date,
      dayNumber:
        date >= trip.startDate && date <= trip.endDate
          ? dayIndex(trip.startDate, date)
          : null,
      items: [...dayItems].sort(compareByTime),
    }));
}

// その日のうち、現在時刻以降に始まる最初の予定
export function findNextItem<T extends Schedulable>(
  items: T[],
  now: TimeString,
): T | null {
  return (
    [...items]
      .sort(compareByTime)
      .find((item) => item.startTime !== null && item.startTime >= now) ?? null
  );
}
