import { describe, expect, it } from "vitest";
import {
  dayIndex,
  eachDate,
  formatDate,
  formatDateRange,
  fromDbDate,
  fromDbTime,
  isDateString,
  isTimeString,
  isValidTimeZone,
  nowIn,
  toDbDate,
  toDbTime,
} from "./date";

describe("date strings", () => {
  it("round-trips dates through the DB representation", () => {
    expect(fromDbDate(toDbDate("2026-10-10"))).toBe("2026-10-10");
  });

  it("round-trips times through the DB representation", () => {
    expect(fromDbTime(toDbTime("09:05"))).toBe("09:05");
  });

  it("validates dates and times", () => {
    expect(isDateString("2026-02-28")).toBe(true);
    expect(isDateString("2026-02-30")).toBe(false);
    expect(isDateString("2026/02/28")).toBe(false);
    expect(isTimeString("23:59")).toBe(true);
    expect(isTimeString("24:00")).toBe(false);
  });

  it("validates IANA time zones", () => {
    expect(isValidTimeZone("Asia/Tokyo")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
  });
});

describe("trip days", () => {
  it("lists every date in the range, across month boundaries", () => {
    expect(eachDate("2026-10-30", "2026-11-02")).toEqual([
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
    ]);
  });

  it("numbers days from 1", () => {
    expect(dayIndex("2026-10-10", "2026-10-10")).toBe(1);
    expect(dayIndex("2026-10-10", "2026-10-12")).toBe(3);
  });

  it("formats dates in Japanese", () => {
    expect(formatDate("2026-10-10")).toBe("10/10（土）");
    expect(formatDateRange("2026-10-10", "2026-10-12")).toBe(
      "10/10（土） 〜 10/12（月）",
    );
    expect(formatDateRange("2026-10-10", "2026-10-10")).toBe("10/10（土）");
  });
});

describe("nowIn", () => {
  const instant = new Date("2026-10-05T16:30:00Z");

  it("returns the local date in Tokyo (already the next day)", () => {
    expect(nowIn("Asia/Tokyo", instant)).toEqual({
      date: "2026-10-06",
      time: "01:30",
    });
  });

  it("returns the local date in Los Angeles", () => {
    expect(nowIn("America/Los_Angeles", instant)).toEqual({
      date: "2026-10-05",
      time: "09:30",
    });
  });

  it("uses 00 rather than 24 at midnight", () => {
    expect(nowIn("UTC", new Date("2026-10-06T00:00:00Z")).time).toBe("00:00");
  });
});
