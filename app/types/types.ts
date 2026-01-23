export type ReportStatus = "draft" | "pending_samples" | "tested" | "approved" | "deleted";
export type StatusFilter = ReportStatus | "all";
export type ReportRow = {
  id: number;
  sample_names:string;
  indicator_names:string;
  created_at: string;
  time: string;
  report_title: string;
  workType: string;
  location: string;
  qty?: string;
  status: ReportStatus;
  sample_type?: string;
};
export type SampleType = { id: number; type_name: string; standard:string };
export type Indicator = { id: number; indicator_name: string; unit?: string; method?: string; limit?: string; is_default?: boolean, input_type?:string; }

export type SampleIndicatorItem = {
  sample_indicator_id: number;
  indicator_id: number;
  indicator_name: string;
  unit?: string | null;
  avg:string | null;
  input_type:string;
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
  sample_amount:string;
  location?: string;
  indicators:SampleIndicatorItem[]
  
};
export type IndicatorRow = {
  indicator_id: number;
  indicator_name: string;
  unit?: string;
  input_type:string;
  limit_value?: string;
  sample_indicator_ids: number[]
  result_value?: string;
  is_detected?: boolean | null;
  is_within_limit?: boolean | null;
  is_default?: boolean | number | null;
  avg:string | null
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
  onOpenChange: (open: boolean) => void;
  sampleTypes: SampleType[];
  from: string;
  to: string;
  onCreated?: () => void;
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

export type SampleGroup = {
  sample_type_id: number | null;
  sample_ids: (number | null)[];
  sample_names: string[];
  sample_amount:string;
  location: string;
  sample_date: string;
  sampled_by: string;
  indicators: number[];
  availableIndicators: Indicator[];
};

export  type SampleGroupEdit = {
  sample_type_id: number | null;
  sample_ids: (number | null)[];
  sample_names: string[];
  location: string;
  sample_date: string;
  sampled_by: string;
  indicators: number[];
  availableIndicators: Indicator[];
};

 export type LocationPackage = {
  id: number;
  package_name: string;
  sample_type_id: number;
};

export type LocationSample = {
  id: number;
  location_name: string;
  sort_order: number;
};

export type IndicatorRowForLabSpec = {
  id: number;
  sample_type_id: number;
  indicator_name: string;
  unit?: string | null;
  test_method?: string | null;
  limit_value?: string | null;
  is_default?: boolean | number | null; 
};


export type NewIndicatorDraft = {
  sample_type_id: number | null;
  indicator_name: string;
  unit: string;
  test_method: string;
  limit_value: string;
  is_default: boolean;
};
