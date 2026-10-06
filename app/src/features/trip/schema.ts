import { z } from "zod";
import {
  dateField,
  optionalText,
  requiredText,
  timeZoneField,
} from "@/lib/validation";

export const tripFields = [
  "title",
  "destination",
  "startDate",
  "endDate",
  "timezone",
  "memo",
] as const;

export const tripSchema = z
  .object({
    title: requiredText("タイトル", 100),
    destination: requiredText("行き先", 100),
    startDate: dateField("開始日"),
    endDate: dateField("終了日"),
    timezone: timeZoneField,
    memo: optionalText("メモ", 2000),
  })
  .refine((trip) => trip.startDate <= trip.endDate, {
    path: ["endDate"],
    error: "終了日は開始日以降にしてください",
  });

export type TripInput = z.infer<typeof tripSchema>;

// 旅行先として選びやすいタイムゾーン。将来の海外旅行に備えて最初から選択式にしておく。
export const TIME_ZONE_OPTIONS = [
  { value: "Asia/Tokyo", label: "日本（東京）" },
  { value: "Asia/Seoul", label: "韓国（ソウル）" },
  { value: "Asia/Taipei", label: "台湾（台北）" },
  { value: "Asia/Shanghai", label: "中国（上海）" },
  { value: "Asia/Hong_Kong", label: "香港" },
  { value: "Asia/Bangkok", label: "タイ（バンコク）" },
  { value: "Asia/Singapore", label: "シンガポール" },
  { value: "Pacific/Honolulu", label: "ハワイ（ホノルル）" },
  { value: "Australia/Sydney", label: "オーストラリア（シドニー）" },
  { value: "Europe/London", label: "イギリス（ロンドン）" },
  { value: "Europe/Paris", label: "フランス（パリ）" },
  { value: "America/New_York", label: "アメリカ東部（ニューヨーク）" },
  { value: "America/Los_Angeles", label: "アメリカ西部（ロサンゼルス）" },
] as const;

export function timeZoneLabel(timeZone: string): string {
  return (
    TIME_ZONE_OPTIONS.find((option) => option.value === timeZone)?.label ??
    timeZone
  );
}
