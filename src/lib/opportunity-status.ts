import { daysUntil } from "@/lib/format";

export type DeadlineStatus = "open" | "closed" | "unknown";

export function getDeadlineStatus(deadline: string | null | undefined): DeadlineStatus {
  if (!deadline?.trim()) return "unknown";
  const days = daysUntil(deadline);
  if (Number.isNaN(days)) return "unknown";
  return days < 0 ? "closed" : "open";
}

export function isOpportunityOpen(deadline: string | null | undefined): boolean {
  const status = getDeadlineStatus(deadline);
  return status === "open" || status === "unknown";
}