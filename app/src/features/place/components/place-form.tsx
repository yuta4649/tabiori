"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { FormFooter } from "@/components/ui/form-footer";
import { inputClass } from "@/components/ui/styles";
import { initialFormState, type FormState } from "@/lib/form";
import { PRIORITY_OPTIONS } from "../schema";
import type { PlaceView } from "@/features/trip/types";

export function PlaceForm({
  action,
  place,
  cancelHref,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  place?: PlaceView;
  cancelHref: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const value = (name: "name" | "address" | "url" | "memo" | "priority") =>
    state.values?.[name] ?? place?.[name] ?? "";
  const errors = state.errors ?? {};
  const priority = value("priority") || "WANT";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field label="名前" htmlFor="name" required errors={errors.name}>
        <input
          id="name"
          name="name"
          defaultValue={value("name")}
          placeholder="函館山"
          aria-invalid={!!errors.name}
          className={inputClass}
        />
      </Field>
      <fieldset className="space-y-1.5">
        <legend className="text-sm font-medium">どのくらい行きたい？</legend>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-neutral-300 px-2 text-center text-sm has-checked:border-teal-600 has-checked:bg-teal-50 has-checked:font-semibold has-checked:text-teal-800 dark:border-neutral-700 dark:has-checked:bg-teal-950 dark:has-checked:text-teal-200"
            >
              <input
                type="radio"
                name="priority"
                value={option.value}
                defaultChecked={priority === option.value}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.priority?.map((error) => (
          <p key={error} className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ))}
      </fieldset>
      <Field label="住所・エリア" htmlFor="address" errors={errors.address}>
        <input
          id="address"
          name="address"
          defaultValue={value("address")}
          placeholder="函館市元町"
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
          placeholder="営業時間、おすすめなど"
          className={inputClass}
        />
      </Field>
      <FormFooter cancelHref={cancelHref} submitLabel={submitLabel} pending={pending} />
    </form>
  );
}
