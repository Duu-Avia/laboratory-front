export type ReportStatus = "draft" | "pending_samples" | "tested" | "approved" | "deleted";
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

export type SampleIndicatorItem = {
  sample_indicator_id: number;
  indicator_id: number;
  indicator_name: string;
  unit?: string | null;
  limit_value?: string | null;

  // result can be null if not created yet
  result?: {
    test_result_id: number;
    result_value?: string | null;
    is_detected?: boolean | null;
    is_within_limit?: boolean | null;
  } | null;
};

export type SampleColumn = {
  sample_id: number;
  sample_name: string;
  location?: string;
  indicators:SampleIndicatorItem[]
  
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
export interface DeleteDialogProps  {
 deleteDialogOpener:boolean, 
 reportId:number | null, 
 setDeleteDialogOpener: (setDeleteDialogOpener:boolean) => void
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
export interface CreateReportModalProps {
  open: boolean;
  reportTitle: string;
  sampleGroup: {
    sample_type_id: number | null;
    sample_names: string[];
    location: string;
    sample_date: string;
    sampled_by: string;
    indicators: number[];
    availableIndicators: Indicator[];
  };
  sampleTypes: SampleType[];
  onOpenChange: (open: boolean) => void;
  onReportTitleChange: (value: string) => void;
  onAddSampleName: () => void;
  onRemoveSampleName: (index: number) => void;
  onUpdateSampleName: (index: number, value: string) => void;
  onTypeChange: (typeId: number) => void;
  onFieldChange: (field: string, value: string) => void;
  onToggleIndicator: (indicatorId: number) => void;
  onSave: () => void;
}
export interface PdfViewModalProps {
  open: boolean;
  reportId: number | null;
  reportTitle: string | null;
  onOpenChange: (open: boolean) => void;
  onAddSampleName: () => void;
  onRemoveSampleName: (index: number) => void;
  onUpdateSampleName: (index: number, value: string) => void;
  onTypeChange: (typeId: number) => Promise<void> | void;
  onFieldChange: (field: string, value: string) => void;
  onToggleIndicator: (indicatorId: number) => void;
  sampleType: any[];
  sampleGroup: any;
  setSampleNameForEdit: (names: string[]) => void;
  setSelectedIndicatorsForEdit: (ids: number[]) => void;
}
