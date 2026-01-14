export type ReportStatus = "draft" | "pending_samples" | "tested" | "approved";
export type StatusFilter = ReportStatus | "all";
export type ReportRow = {
  id: number;
  sample_names:string;
  created_at: string;
  time: string;
  report_title: string;
  workType: string;
  location: string;
  qty?: string;
  status: ReportStatus;
  sample_type?: string;
};
export type SampleType = { id: number; type_name: string };
export type Indicator = { id: number; indicator_name: string; unit?: string; method?: string; limit?: string; is_default?: boolean }
export type FlatRow = {
  sample_id: number;
  sample_name: string;
  location: string | null;
  sample_indicator_id: number;
  indicator_id: number;
  indicator_name: string;
  unit: string | null;
  limit_value: string | null;
  result_value: string | null;
  is_detected: boolean | null;
  is_within_limit: boolean | null;
}
export type SampleColumn = {
  sample_id: number;
  sample_name: string;
  location?: string;
};
export type IndicatorRow = {
  indicator_id: number;
  indicator_name: string;
  unit?: string;
  limit_value?: string;
  sample_indicator_ids: number[]; // All sample_indicator_ids for this indicator
  result_value?: string;
  is_detected?: boolean | null;
  is_within_limit?: boolean | null;
};
export interface ReportHeaderSaveProps  {
  reportId: string,
  onSave: () => void;
  onExport: () => void;
}

export interface FilterBarProps {
  from: string;
  to: string;
  search: string;
  selectedSampleType: string;
  status: StatusFilter;
  sampleTypes: SampleType[];
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSampleTypeChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onCreateClick: () => void;
  onExportClick: () => void;
}