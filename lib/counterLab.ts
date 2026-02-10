import type { ReportRow } from "@/types";

/** Count reports per lab_type (excluding deleted) */
export function countByLabType(data: ReportRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of data) {
    if (r.status === "deleted" || !r.lab_type) continue;
    counts[r.lab_type] = (counts[r.lab_type] ?? 0) + 1;
  }
  return counts;
}
