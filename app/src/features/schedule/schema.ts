import { z } from "zod";
import {
  dateField,
  optionalText,
  optionalTime,
  optionalUrl,
  requiredText,
} from "@/lib/validation";

export const scheduleItemFields = [
  "date",
  "startTime",
  "endTime",
  "title",
  "location",
  "placeId",
  "memo",
  "url",
] as const;

export const scheduleItemSchema = z
  .object({
    date: dateField("日付"),
    startTime: optionalTime,
    endTime: optionalTime,
    title: requiredText("予定", 100),
    location: optionalText("場所", 200),
    placeId: z
      .union([z.literal(""), z.uuid({ error: "行きたい場所が正しくありません" })])
      .transform((value) => value || null),
    memo: optionalText("メモ", 2000),
    url: optionalUrl,
  })
  .refine((item) => !item.endTime || item.startTime, {
    path: ["startTime"],
    error: "終了時刻を入れる場合は開始時刻も入力してください",
  })
  .refine(
    (item) => !item.startTime || !item.endTime || item.startTime <= item.endTime,
    { path: ["endTime"], error: "終了時刻は開始時刻以降にしてください" },
  );

export type ScheduleItemInput = z.infer<typeof scheduleItemSchema>;
