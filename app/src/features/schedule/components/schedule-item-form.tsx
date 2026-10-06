"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { FormFooter } from "@/components/ui/form-footer";
import { inputClass } from "@/components/ui/styles";
import { initialFormState, type FormState } from "@/lib/form";
import type { ScheduleItemView, TripView } from "@/features/trip/types";

type Defaults = Partial<Omit<ScheduleItemView, "place">> & { placeId?: string | null };

export function ScheduleItemForm({
  action,
  trip,
  places,
  defaults,
  cancelHref,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  trip: Pick<TripView, "startDate" | "endDate">;
  places: { id: string; name: string }[];
  defaults: Defaults;
  cancelHref: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const value = (name: keyof Defaults) =>
    state.values?.[name] ?? defaults[name] ?? "";
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field label="日付" htmlFor="date" required errors={errors.date}>
        <input
          id="date"
          name="date"
          type="date"
          min={trip.startDate}
          max={trip.endDate}
          defaultValue={value("date")}
          aria-invalid={!!errors.date}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="開始時刻" htmlFor="startTime" errors={errors.startTime}>
          <input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={value("startTime")}
            aria-invalid={!!errors.startTime}
            className={inputClass}
          />
        </Field>
        <Field label="終了時刻" htmlFor="endTime" errors={errors.endTime}>
          <input
            id="endTime"
            name="endTime"
            type="time"
            defaultValue={value("endTime")}
            aria-invalid={!!errors.endTime}
            className={inputClass}
          />
        </Field>
      </div>
      <p className="-mt-3 text-xs text-neutral-500 dark:text-neutral-400">
        時刻が決まっていない予定は、その日の最後に表示されます
      </p>
      <Field label="予定" htmlFor="title" required errors={errors.title}>
        <input
          id="title"
          name="title"
          defaultValue={value("title")}
          placeholder="函館朝市で朝ごはん"
          aria-invalid={!!errors.title}
          className={inputClass}
        />
      </Field>
      {places.length > 0 ? (
        <Field label="行きたい場所から選ぶ" htmlFor="placeId" errors={errors.placeId}>
          <select
            id="placeId"
            name="placeId"
            defaultValue={value("placeId")}
            className={inputClass}
          >
            <option value="">選ばない</option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <input type="hidden" name="placeId" value="" />
      )}
      <Field label="場所" htmlFor="location" errors={errors.location}>
        <input
          id="location"
          name="location"
          defaultValue={value("location")}
          placeholder="函館駅前"
          className={inputClass}
        />
      </Field>
      <Field label="URL" htmlFor="url" errors={errors.url}>
        <input
          id="url"
          name="url"
          type="url"
          inputMode="url"
          defaultValue={value("url")}
          placeholder="https://"
          aria-invalid={!!errors.url}
          className={inputClass}
        />
      </Field>
      <Field label="メモ" htmlFor="memo" errors={errors.memo}>
        <textarea
          id="memo"
          name="memo"
          rows={3}
          defaultValue={value("memo")}
          placeholder="予約番号、持ち物など"
          className={inputClass}
        />
      </Field>
      <FormFooter cancelHref={cancelHref} submitLabel={submitLabel} pending={pending} />
    </form>
  );
}
