import { z } from "zod";
import { isDateString, isTimeString, isValidTimeZone } from "./date";

export function requiredText(label: string, max: number) {
  return z
    .string()
    .trim()
    .min(1, `${label}を入力してください`)
    .max(max, `${label}は${max}文字以内で入力してください`);
}

export function optionalText(label: string, max: number) {
  return z
    .string()
    .trim()
    .max(max, `${label}は${max}文字以内で入力してください`)
    .transform((value) => value || null);
}

export const optionalUrl = z
  .string()
  .trim()
  .pipe(
    z.union([
      z.literal(""),
      z.url({
        protocol: /^https?$/,
        error: "http:// または https:// から始まるURLを入力してください",
      }),
    ]),
  )
  .transform((value) => value || null);

export function dateField(label: string) {
  return z.string().refine(isDateString, `${label}を入力してください`);
}

export const optionalTime = z
  .string()
  .refine(
    (value) => value === "" || isTimeString(value),
    "時刻は HH:MM の形式で入力してください",
  )
  .transform((value) => value || null);

export const timeZoneField = z
  .string()
  .refine(isValidTimeZone, "タイムゾーンが正しくありません");
