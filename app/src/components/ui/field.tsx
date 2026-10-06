import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  errors,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  errors?: string[];
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
        {required ? (
          <span className="ml-1 text-xs text-red-600 dark:text-red-400">必須</span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
      ) : null}
      {errors?.map((error) => (
        <p
          key={error}
          id={`${htmlFor}-error`}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ))}
    </div>
  );
}
