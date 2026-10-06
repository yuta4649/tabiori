import { describe, expect, it } from "vitest";
import { findNextItem, groupScheduleByDay } from "./group";

const trip = { startDate: "2026-10-10", endDate: "2026-10-12" };

function item(id: string, date: string, startTime: string | null) {
  return { id, date, startTime };
}

describe("groupScheduleByDay", () => {
  it("includes every trip day, even without items", () => {
    const days = groupScheduleByDay(trip, []);
    expect(days.map((day) => [day.date, day.dayNumber])).toEqual([
      ["2026-10-10", 1],
      ["2026-10-11", 2],
      ["2026-10-12", 3],
    ]);
  });

  it("orders items by date and then time, with untimed items last", () => {
    const days = groupScheduleByDay(trip, [
      item("dinner", "2026-10-11", "18:00"),
      item("souvenir", "2026-10-11", null),
      item("morning-market", "2026-10-11", "07:30"),
      item("arrival", "2026-10-10", "12:00"),
    ]);
    expect(days[0].items.map((i) => i.id)).toEqual(["arrival"]);
    expect(days[1].items.map((i) => i.id)).toEqual([
      "morning-market",
      "dinner",
      "souvenir",
    ]);
    expect(days[2].items).toEqual([]);
  });

  it("keeps items outside the trip period in their own days", () => {
    const days = groupScheduleByDay(trip, [
      item("before", "2026-10-09", "10:00"),
      item("after", "2026-10-13", null),
    ]);
    expect(days.map((day) => [day.date, day.dayNumber])).toEqual([
      ["2026-10-09", null],
      ["2026-10-10", 1],
      ["2026-10-11", 2],
      ["2026-10-12", 3],
      ["2026-10-13", null],
    ]);
  });
});

describe("findNextItem", () => {
  const items = [
    item("lunch", "2026-10-11", "12:00"),
    item("souvenir", "2026-10-11", null),
    item("ropeway", "2026-10-11", "17:30"),
  ];

  it("returns the first item starting at or after now", () => {
    expect(findNextItem(items, "12:30")?.id).toBe("ropeway");
    expect(findNextItem(items, "12:00")?.id).toBe("lunch");
  });

  it("returns null when nothing is left today", () => {
    expect(findNextItem(items, "20:00")).toBeNull();
  });
});
