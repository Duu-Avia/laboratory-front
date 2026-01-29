/**
 * Report-related types
 */

export type ReportStatus =
  | "draft"
  | "pending_samples"
  | "tested"
  | "approved"
  | "deleted";

export type StatusFilter = ReportStatus | "all";

export type ReportRow = {
  id: number;
  sample_names: string;
  indicator_names: string;
  created_at: string;
  time: string;
  report_title: string;
  workType: string;
  location: string;
  qty?: string;
  status: ReportStatus;
  sample_type?: string;
};
