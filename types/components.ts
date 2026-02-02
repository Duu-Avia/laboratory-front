/**
 * Component Props types
 */

import { ReportRow, StatusFilter } from "./report";
import { LabType } from "./sample";

export interface FilterBarProps {
  from: string;
  to: string;
  search: string;
  selectedLabType: string;
  status: StatusFilter;
  labTypes: LabType[];
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onLabTypeChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onCreateClick: () => void;
  onExportClick: () => void;
}

export interface ArchiveFilterBarProps {
  from: string;
  to: string;
  search: string;
  selectedLabType: string;
  status: StatusFilter;
  labTypes: LabType[];
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onLabTypeChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onExportClick: () => void;
}

export interface ReportsTableProps {
  data: ReportRow[];
  onRowClick: (report: ReportRow) => void;
}

export interface ReportHeaderSaveProps {
  reportId: string;
  onSave: () => void;
  onExport: () => void;
}

export interface DeleteDialogProps {
  deleteDialogOpener: boolean;
  reportId: number | null;
  setDeleteDialogOpener: (open: boolean) => void;
}

export interface CreateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labTypes: LabType[];
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
  labType: LabType[];
  sampleGroup: unknown;
  setSampleNameForEdit: (names: string[]) => void;
  setSelectedIndicatorsForEdit: (ids: number[]) => void;
}
