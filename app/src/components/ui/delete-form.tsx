"use client";

import { useFormStatus } from "react-dom";
import { buttonClass } from "./styles";

function DeleteButton({ label, confirmMessage }: { label: string; confirmMessage: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${buttonClass.danger} w-full`}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {pending ? "削除しています…" : label}
    </button>
  );
}

export function DeleteForm({
  action,
  label,
  confirmMessage,
}: {
  action: () => Promise<void>;
  label: string;
  confirmMessage: string;
}) {
  return (
    <form action={action}>
      <DeleteButton label={label} confirmMessage={confirmMessage} />
    </form>
  );
}
