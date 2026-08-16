export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatINRExact(amount: number): string {
  return `₹${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

/** Elapsed fraction of a work's official timeline, 0–1. */
export function timeProgress(start: string | null, deadline: string | null): number {
  if (!start || !deadline) return 0;
  const s = new Date(start).getTime();
  const d = new Date(deadline).getTime();
  if (d <= s) return 1;
  return Math.min(1, Math.max(0, (Date.now() - s) / (d - s)));
}

/** Applies the deadline rule client-side so a passed deadline always reads as delayed. */
export function effectiveStatus(status: string, deadline: string | null, completedOn: string | null) {
  if (status === "completed" || completedOn) return "completed";
  if (deadline && new Date(deadline).getTime() < Date.now()) return "delayed";
  return status;
}

export const escalationLabels = ["lvl1", "lvl2", "lvl3", "lvl4"] as const;
