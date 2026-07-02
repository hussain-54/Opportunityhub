export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    ...opts,
  });
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).toUpperCase();
}

export function daysUntil(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function deadlineLabel(iso: string) {
  const days = daysUntil(iso);
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days <= 30) return `${days} days left`;
  return shortDate(iso);
}
