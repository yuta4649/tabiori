import { describe, expect, it } from "vitest";
import { tripStatus } from "./status";

const trip = {
  startDate: "2026-10-10",
  endDate: "2026-10-12",
  timezone: "Asia/Tokyo",
};

describe("tripStatus", () => {
  it("is upcoming before the first day", () => {
    expect(tripStatus(trip, new Date("2026-10-09T03:00:00Z"))).toBe("upcoming");
  });

  it("is ongoing from the first day in the trip's time zone", () => {
    // UTC ではまだ 10/9 だが、東京ではすでに 10/10
    expect(tripStatus(trip, new Date("2026-10-09T15:30:00Z"))).toBe("ongoing");
  });

  it("is past after the last day", () => {
    expect(tripStatus(trip, new Date("2026-10-12T15:30:00Z"))).toBe("past");
  });

  it("uses the trip's own time zone", () => {
    const honolulu = { ...trip, timezone: "Pacific/Honolulu" };
    // 東京では 10/10 だが、ホノルルではまだ 10/9
    expect(tripStatus(honolulu, new Date("2026-10-09T15:30:00Z"))).toBe(
      "upcoming",
    );
  });
});
