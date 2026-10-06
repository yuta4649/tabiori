// 日付は "YYYY-MM-DD"、時刻は "HH:MM" の文字列としてアプリ内で扱う。
// Prisma は @db.Date / @db.Time を UTC 基準の Date で返すため、変換はこのファイルに集約する。

export type DateString = string; // "YYYY-MM-DD"
export type TimeString = string; // "HH:MM"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function isDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function isTimeString(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function toDbDate(value: DateString): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function fromDbDate(value: Date): DateString {
  return value.toISOString().slice(0, 10);
}

export function toDbTime(value: TimeString): Date {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

export function fromDbTime(value: Date): TimeString {
  return value.toISOString().slice(11, 16);
}

export function eachDate(start: DateString, end: DateString): DateString[] {
  const dates: DateString[] = [];
  const cursor = toDbDate(start);
  const last = toDbDate(end);
  while (cursor <= last) {
    dates.push(fromDbDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function dayIndex(start: DateString, date: DateString): number {
  const diff = toDbDate(date).getTime() - toDbDate(start).getTime();
  return Math.round(diff / 86_400_000) + 1;
}

// 例: "2026-10-10" → "10/10（土）"
export function formatDate(value: DateString): string {
  const date = toDbDate(value);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}（${WEEKDAYS[date.getUTCDay()]}）`;
}

export function formatDateRange(start: DateString, end: DateString): string {
  return start === end
    ? formatDate(start)
    : `${formatDate(start)} 〜 ${formatDate(end)}`;
}

// 指定タイムゾーンでの現在の日付と時刻。サーバーのタイムゾーン（ECS では UTC）に依存しない。
export function nowIn(
  timeZone: string,
  now: Date = new Date(),
): { date: DateString; time: TimeString } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}
