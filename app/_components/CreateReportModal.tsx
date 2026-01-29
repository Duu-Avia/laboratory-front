"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SampleFormSection } from "./SampleFormSection";

// Types - use @/types instead of relative path
import type { CreateReportModalProps, Indicator, SampleGroup } from "@/types";

// Lib - use new API client and error handling
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage, logError } from "@/lib/errors";

const getEmptySampleGroup = (defaultDate: string): SampleGroup => ({
  sample_type_id: null,
  sample_ids: [],
  sample_names: [""],
  location: "",
  sample_date: defaultDate,
  sample_amount: "",
  sampled_by: "",
  indicators: [],
  availableIndicators: [],
});

export function CreateReportModal({
  open,
  onOpenChange,
  sampleTypes,
  from,
  to,
  onCreated,
}: CreateReportModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null); // Error state for UI
  const [reportTitle, setReportTitle] = useState("");
  const [reportTitleTouched, setReportTitleTouched] = useState(false);
  const [sampleGroup, setSampleGroup] = useState<SampleGroup>(
    getEmptySampleGroup(from)
  );

  const calculateTestEndDate = (startDate: string) => {
    const endTestDate = new Date(startDate);
    endTestDate.setDate(endTestDate.getDate() + 3);
    return endTestDate.toISOString().slice(0, 10);
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setReportTitle("");
      setReportTitleTouched(false);
      setError(null); // Clear error when modal opens
      setSampleGroup(getEmptySampleGroup(to));
    }
  }, [open, to]);

  // Update report title when location changes
  useEffect(() => {
    if (!open) return;
    if (reportTitleTouched) return;
    setReportTitle(sampleGroup.location || "");
  }, [open, sampleGroup.location, reportTitleTouched]);

  // Load available indicators when sample type changes
  useEffect(() => {
    if (!open || !sampleGroup.sample_type_id) return;

    // Using api client - auto adds auth headers
    api
      .get<Indicator[]>(ENDPOINTS.INDICATORS.BY_SAMPLE_TYPE(sampleGroup.sample_type_id))
      .then((indicators) => {
        setSampleGroup((p) => ({
          ...p,
          availableIndicators: indicators,
          indicators: indicators.map((ind) => ind.id),
        }));
      })
      .catch((err) => {
        logError(err, "Fetch indicators");
        setSampleGroup((p) => ({ ...p, availableIndicators: [] }));
      });
  }, [open, sampleGroup.sample_type_id]);

  const handleSave = async () => {
    // Validation - set error state instead of alert()
    const samples = sampleGroup.sample_names
      .filter((name) => name.trim() !== "")
      .map((name) => ({
        sample_type_id: sampleGroup.sample_type_id,
        sample_name: name.trim(),
        sample_amount: sampleGroup.sample_amount,
        location: sampleGroup.location,
        sample_date: sampleGroup.sample_date,
        sampled_by: sampleGroup.sampled_by,
        indicators: sampleGroup.indicators,
      }));

    if (samples.length === 0) {
      setError("Дор хаяж нэг дээж нэмнэ үү");
      return;
    }

    if (!sampleGroup.sample_type_id) {
      setError("Дээжний төрөл сонгоно уу");
      return;
    }

    const payload = {
      report_title: reportTitle || sampleGroup.location || "",
      test_start_date: sampleGroup.sample_date,
      test_end_date: calculateTestEndDate(sampleGroup.sample_date),
      analyst: "",
      approved_by: "",
      samples,
    };

    try {
      setError(null); // Clear previous errors
      setSaving(true);

      // Using api client - auto adds auth headers
      await api.post(ENDPOINTS.REPORTS.CREATE, payload);

      onCreated?.();
      onOpenChange(false);
    } catch (err) {
      logError(err, "Create report");
      setError(getErrorMessage(err)); // Show user-friendly error
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Шинэ хүсэлт</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error message display */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Тайлан</Label>
            <Input
              value={reportTitle}
              onChange={(e) => {
                setReportTitleTouched(true);
                setReportTitle(e.target.value);
              }}
              placeholder="Нэгдсэн төв ус гэх мэт..."
            />
          </div>

          <SampleFormSection
            sampleGroup={sampleGroup}
            setSampleGroup={setSampleGroup}
            sampleTypes={sampleTypes}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Болих
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
