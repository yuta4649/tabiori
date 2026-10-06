import Link from "next/link";
import { ExternalLink } from "@/components/ui/external-link";
import type { PlaceView } from "@/features/trip/types";
import { priorityLabel } from "../schema";

const PRIORITY_BADGE: Record<PlaceView["priority"], string> = {
  MUST: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  WANT: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  MAYBE: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

export function PlaceList({
  tripId,
  places,
}: {
  tripId: string;
  places: PlaceView[];
}) {
  if (places.length === 0) {
    return (
      <p className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
        行きたい場所はまだありません
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {places.map((place) => (
        <li
          key={place.id}
          className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <Link
            href={`/trips/${tripId}/places/${place.id}/edit`}
            className="block px-4 pt-3 pb-3"
          >
            <div className="flex items-start gap-2">
              <span className="min-w-0 flex-1 font-semibold leading-snug">
                {place.name}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE[place.priority]}`}
              >
                {priorityLabel(place.priority)}
              </span>
            </div>
            {place.address ? (
              <div className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                📍 {place.address}
              </div>
            ) : null}
            {place.memo ? (
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
                {place.memo}
              </p>
            ) : null}
            {place.scheduledCount > 0 ? (
              <div className="mt-1.5 text-xs font-medium text-teal-700 dark:text-teal-400">
                ✓ 予定に入っています
              </div>
            ) : null}
          </Link>
          {place.url ? (
            <div className="-mt-2 px-4 pb-2">
              <ExternalLink href={place.url} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
