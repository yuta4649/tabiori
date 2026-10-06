"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { FormFooter } from "@/components/ui/form-footer";
import { inputClass } from "@/components/ui/styles";
import { initialFormState, type FormState } from "@/lib/form";
import { TIME_ZONE_OPTIONS } from "../schema";
import type { TripView } from "../types";

export function TripForm({
  action,
  trip,
  cancelHref,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  trip?: TripView;
  cancelHref: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const value = (name: keyof TripView) =>
    state.values?.[name] ?? trip?.[name] ?? "";
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field label="タイトル" htmlFor="title" required errors={errors.title}>
        <input
          id="title"
          name="title"
          defaultValue={value("title")}
          placeholder="函館旅行"
          aria-invalid={!!errors.title}
          className={inputClass}
        />
      </Field>
      <Field label="行き先" htmlFor="destination" required errors={errors.destination}>
        <input
          id="destination"
          name="destination"
          defaultValue={value("destination")}
          placeholder="北海道・函館"
          aria-invalid={!!errors.destination}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="開始日" htmlFor="startDate" required errors={errors.startDate}>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={value("startDate")}
            aria-invalid={!!errors.startDate}
            className={inputClass}
          />
        </Field>
        <Field label="終了日" htmlFor="endDate" required errors={errors.endDate}>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={value("endDate")}
            aria-invalid={!!errors.endDate}
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        label="現地のタイムゾーン"
        htmlFor="timezone"
        hint="予定の時刻と「今日」の判定に使います"
        errors={errors.timezone}
      >
        <select
          id="timezone"
          name="timezone"
          defaultValue={value("timezone") || "Asia/Tokyo"}
          className={inputClass}
        >
          {TIME_ZONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="メモ" htmlFor="memo" errors={errors.memo}>
        <textarea
          id="memo"
          name="memo"
          rows={4}
          defaultValue={value("memo")}
          placeholder="宿泊先、集合場所など"
          className={inputClass}
        />
      </Field>
      <FormFooter cancelHref={cancelHref} submitLabel={submitLabel} pending={pending} />
    </form>
  );
}
