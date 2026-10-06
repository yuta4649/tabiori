import type { z } from "zod";

export type FormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  // 検証エラー時に入力内容を戻すため、送信された値を保持する
  values?: Record<string, string>;
};

export const initialFormState: FormState = {};

export function readForm(formData: FormData, keys: readonly string[]) {
  return Object.fromEntries(
    keys.map((key) => [key, String(formData.get(key) ?? "")]),
  );
}

export function toFormErrors(
  error: z.ZodError,
  values: Record<string, string>,
): FormState {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return { errors: fieldErrors, values };
}
