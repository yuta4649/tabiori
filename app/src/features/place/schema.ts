import { z } from "zod";
import { PlacePriority } from "@/generated/prisma/enums";
import { optionalText, optionalUrl, requiredText } from "@/lib/validation";

export const placeFields = [
  "name",
  "address",
  "url",
  "memo",
  "priority",
] as const;

export const placeSchema = z.object({
  name: requiredText("名前", 100),
  address: optionalText("住所・エリア", 200),
  url: optionalUrl,
  memo: optionalText("メモ", 2000),
  priority: z.enum(PlacePriority, { error: "優先度を選んでください" }),
});

export type PlaceInput = z.infer<typeof placeSchema>;

export const PRIORITY_OPTIONS = [
  { value: PlacePriority.MUST, label: "絶対行きたい" },
  { value: PlacePriority.WANT, label: "行きたい" },
  { value: PlacePriority.MAYBE, label: "時間があれば" },
] as const;

export function priorityLabel(priority: PlacePriority): string {
  return PRIORITY_OPTIONS.find((option) => option.value === priority)!.label;
}
