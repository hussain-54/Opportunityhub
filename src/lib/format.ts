export function formatDate(iso: string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    ...opts,
  });
}

export function shortDate(iso: string | null | undefined) {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase();
}

/** Calendar-day difference using UTC midnight to reduce timezone flicker. */
export function daysUntil(iso: string | null | undefined) {
  if (!iso?.trim()) return Number.NaN;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return Number.NaN;
  const today = new Date();
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const utcTarget = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  return Math.round((utcTarget - utcToday) / (1000 * 60 * 60 * 24));
}

export function deadlineLabel(iso: string | null | undefined) {
  if (!iso?.trim()) return "Rolling / TBA";
  const days = daysUntil(iso);
  if (Number.isNaN(days)) return "Date TBA";
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days <= 30) return `${days} day${days === 1 ? "" : "s"} left`;
  return shortDate(iso);
}
