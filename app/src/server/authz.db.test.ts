// 認可の結合テスト。ローカルの PostgreSQL（pnpm db:up）を使う。
// ログイン中のユーザーを差し替えながら、queries / Server Actions を直接呼び出す。

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlace, deletePlace, updatePlace } from "@/features/place/actions";
import { getPlace, listPlaceOptions } from "@/features/place/queries";
import {
  createScheduleItem,
  deleteScheduleItem,
  updateScheduleItem,
} from "@/features/schedule/actions";
import { getScheduleItem } from "@/features/schedule/queries";
import { createTrip, deleteTrip, updateTrip } from "@/features/trip/actions";
import { getTrip, getTripDetail, listTrips } from "@/features/trip/queries";
import { toDbDate } from "@/lib/date";
import { getPrisma } from "./db";
import { requireUser, type CurrentUser } from "./session";

vi.mock("./session", () => ({ requireUser: vi.fn(), getCurrentUser: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const prisma = getPrisma();
const runId = randomUUID().slice(0, 8);
const alice: CurrentUser = { id: `test-alice-${runId}`, name: "Alice", email: `alice-${runId}@tabiori.test` };
const bob: CurrentUser = { id: `test-bob-${runId}`, name: "Bob", email: `bob-${runId}@tabiori.test` };

let aliceTripId: string;
let alicePlaceId: string;
let aliceItemId: string;
let bobTripId: string;

function signInAs(user: CurrentUser) {
  vi.mocked(requireUser).mockResolvedValue(user);
}

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const tripForm = () =>
  form({
    title: "乗っ取り",
    destination: "どこか",
    startDate: "2026-11-03",
    endDate: "2026-11-05",
    timezone: "Asia/Tokyo",
    memo: "",
  });
const placeForm = () =>
  form({ name: "乗っ取り", address: "", url: "", memo: "", priority: "WANT" });
const itemForm = (placeId = "") =>
  form({
    date: "2026-11-04",
    startTime: "10:00",
    endTime: "",
    title: "乗っ取り",
    location: "",
    placeId,
    memo: "",
    url: "",
  });

// notFound() / redirect() は Next.js が処理する例外を投げる
async function expectNotFound(promise: Promise<unknown>) {
  await expect(promise).rejects.toMatchObject({
    digest: expect.stringContaining("404"),
  });
}
async function expectRedirect(promise: Promise<unknown>) {
  await expect(promise).rejects.toMatchObject({
    digest: expect.stringMatching(/^NEXT_REDIRECT/),
  });
}

beforeAll(async () => {
  await prisma.user.createMany({ data: [alice, bob] });
  const trip = await prisma.trip.create({
    data: {
      ownerId: alice.id,
      title: "Alice の函館旅行",
      destination: "函館",
      startDate: toDbDate("2026-11-03"),
      endDate: toDbDate("2026-11-05"),
      places: { create: { name: "函館山", priority: "MUST" } },
    },
    include: { places: true },
  });
  aliceTripId = trip.id;
  alicePlaceId = trip.places[0].id;
  const item = await prisma.scheduleItem.create({
    data: {
      tripId: trip.id,
      placeId: alicePlaceId,
      date: toDbDate("2026-11-04"),
      title: "ロープウェイ",
    },
  });
  aliceItemId = item.id;
  const bobTrip = await prisma.trip.create({
    data: {
      ownerId: bob.id,
      title: "Bob の旅行",
      destination: "札幌",
      startDate: toDbDate("2026-11-03"),
      endDate: toDbDate("2026-11-05"),
    },
  });
  bobTripId = bobTrip.id;
});

afterAll(async () => {
  // 旅行・場所・予定は ON DELETE CASCADE で消える
  await prisma.user.deleteMany({ where: { id: { in: [alice.id, bob.id] } } });
});

describe("another user cannot read the trip", () => {
  beforeEach(() => signInAs(bob));

  it("is excluded from the trip list", async () => {
    const trips = await listTrips();
    expect(trips.map((trip) => trip.id)).toEqual([bobTripId]);
  });

  it("returns nothing for direct ID access", async () => {
    expect(await getTrip(aliceTripId)).toBeNull();
    expect(await getTripDetail(aliceTripId)).toBeNull();
    expect(await getPlace(aliceTripId, alicePlaceId)).toBeNull();
    expect(await getScheduleItem(aliceTripId, aliceItemId)).toBeNull();
    expect(await listPlaceOptions(aliceTripId)).toEqual([]);
  });

  it("cannot reach another user's place or item through their own tripId", async () => {
    expect(await getPlace(bobTripId, alicePlaceId)).toBeNull();
    expect(await getScheduleItem(bobTripId, aliceItemId)).toBeNull();
  });
});

describe("another user cannot change the trip", () => {
  beforeEach(() => signInAs(bob));

  it("rejects every Server Action targeting the trip", async () => {
    await expectNotFound(updateTrip(aliceTripId, {}, tripForm()));
    await expectNotFound(deleteTrip(aliceTripId));
    await expectNotFound(createPlace(aliceTripId, {}, placeForm()));
    await expectNotFound(updatePlace(aliceTripId, alicePlaceId, {}, placeForm()));
    await expectNotFound(deletePlace(aliceTripId, alicePlaceId));
    await expectNotFound(createScheduleItem(aliceTripId, {}, itemForm()));
    await expectNotFound(updateScheduleItem(aliceTripId, aliceItemId, {}, itemForm()));
    await expectNotFound(deleteScheduleItem(aliceTripId, aliceItemId, "2026-11-04"));
  });

  it("rejects mixing their own tripId with another user's IDs", async () => {
    await expectNotFound(updatePlace(bobTripId, alicePlaceId, {}, placeForm()));
    await expectNotFound(deletePlace(bobTripId, alicePlaceId));
    await expectNotFound(updateScheduleItem(bobTripId, aliceItemId, {}, itemForm()));
    await expectNotFound(deleteScheduleItem(bobTripId, aliceItemId, "2026-11-04"));
  });

  it("cannot link another user's place to their own schedule", async () => {
    const state = await createScheduleItem(bobTripId, {}, itemForm(alicePlaceId));
    expect(state.errors?.placeId).toEqual(["行きたい場所が見つかりません"]);
  });

  it("leaves the data unchanged", async () => {
    const trip = await prisma.trip.findUniqueOrThrow({
      where: { id: aliceTripId },
      include: { places: true, scheduleItems: true },
    });
    expect(trip.title).toBe("Alice の函館旅行");
    expect(trip.places.map((place) => place.name)).toEqual(["函館山"]);
    expect(trip.scheduleItems.map((item) => item.title)).toEqual(["ロープウェイ"]);
  });
});

describe("the owner can use the trip", () => {
  beforeEach(() => signInAs(alice));

  it("reads and updates their own trip", async () => {
    expect((await getTripDetail(aliceTripId))?.scheduleItems).toHaveLength(1);
    await expectRedirect(updateTrip(aliceTripId, {}, tripForm()));
    const trip = await prisma.trip.findUniqueOrThrow({ where: { id: aliceTripId } });
    expect(trip.title).toBe("乗っ取り");
  });

  it("creates trips owned by themselves", async () => {
    await expectRedirect(createTrip({}, tripForm()));
    const owned = await prisma.trip.count({ where: { ownerId: alice.id } });
    expect(owned).toBe(2);
  });
});
