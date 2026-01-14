"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SampleFormSection } from "./SampleFormSection";
import { Indicator, SampleType } from "../types/types";

interface CreateReportModalProps {
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

export function CreateReportModal({
  open,
  reportTitle,
  sampleGroup,
  sampleTypes,
  onOpenChange,
  onReportTitleChange,
  onAddSampleName,
  onRemoveSampleName,
  onUpdateSampleName,
  onTypeChange,
  onFieldChange,
  onToggleIndicator,
  onSave,
}: CreateReportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Шинэ хүсэлт</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Тайлан</Label>
            <Input
              value={reportTitle}
              onChange={(e) => onReportTitleChange(e.target.value)}
              placeholder="Нэгдсэн төв ус гэх мэт..."
            />
          </div>

          <SampleFormSection
            sampleGroup={sampleGroup}
            sampleTypes={sampleTypes}
            onAddSampleName={onAddSampleName}
            onRemoveSampleName={onRemoveSampleName}
            onUpdateSampleName={onUpdateSampleName}
            onTypeChange={onTypeChange}
            onFieldChange={onFieldChange}
            onToggleIndicator={onToggleIndicator}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Болих
          </Button>
          <Button onClick={onSave}>Хадгалах</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}