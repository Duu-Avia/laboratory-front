/**
 * Report-related types
 */

export type ReportStatus =
  | "draft"
  | "pending_samples"
  | "incomplete"
  | "signed"
  | "tested"
  | "approved"
  | "rejected"
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
  lab_type?: string;
  assigned_to?: number;
  approved_by:string;
  signed_by:string;
  assigned_to_name?: string;
  approved_at:string;
  created_by?: number;
  created_by_name?: string;
};

export type ColumnFilters = {
  created_at: string;
  id: string;
  sample_names: string;
  indicator_names: string;
  created_by_name: string;
  approved_by:string;
  signed_by:string;
  status: string;
};
