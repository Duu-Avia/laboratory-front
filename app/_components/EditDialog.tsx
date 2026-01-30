"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SampleFormSection } from "./SampleFormSection";
import type {
  Indicator,
  SampleGroup,
  SampleType,
} from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError } from "@/lib/errors";

const emptySampleGroup: SampleGroup = {
  sample_type_id: null,
  sample_ids: [],
  sample_amount: "",
  sample_names: [""],
  location: "",
  sample_date: "",
  sampled_by: "",
  indicators: [],
  availableIndicators: [],
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number | null;
  sampleTypes: SampleType[];
  onSaved?: () => void;
};

export function EditReport({
  open,
  onOpenChange,
  reportId,
  sampleTypes,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [sampleGroup, setSampleGroup] = useState<SampleGroup>(emptySampleGroup);

  // Fetch report data when modal opens
  useEffect(() => {
    if (!open || !reportId) return;

    setLoading(true);

    api
      .get<{ report?: { report_title: string }; samples: any[] }>(
        ENDPOINTS.REPORTS.DETAIL(reportId)
      )
      .then((data) => {
        const samples = data.samples ?? [];
        const first = samples[0];

        setReportTitle(data.report?.report_title ?? "");

        const selectedIndicators = new Set<number>();
        for (const s of samples) {
          for (const ind of s.indicators ?? []) {
            selectedIndicators.add(ind.indicator_id);
          }
        }

        const loadedNames = samples.map((s: any) => s.sample_name);
        const loadedIds = samples.map((s: any) => s.sample_id);

        setSampleGroup({
          sample_type_id: first?.sample_type_id ?? null,
          sample_ids: loadedIds,
          sample_amount: first?.sample_amount ?? "",
          sample_names: loadedNames.length ? loadedNames : [""],
          location: first?.location ?? "",
          sample_date: (first?.sample_date ?? "").slice(0, 10),
          sampled_by: first?.sampled_by ?? "",
          indicators: Array.from(selectedIndicators),
          availableIndicators: [],
        });
      })
      .catch((err) => logError(err, "Fetch report for edit"))
      .finally(() => setLoading(false));
  }, [open, reportId]);

  // Load available indicators when sample type changes
  useEffect(() => {
    if (!open || !sampleGroup.sample_type_id) {
      return;
    }

    api
      .get<Indicator[]>(ENDPOINTS.INDICATORS.BY_SAMPLE_TYPE(sampleGroup.sample_type_id))
      .then((indicators) => {
        setSampleGroup((p) => ({ ...p, availableIndicators: indicators }));
      })
      .catch(() => {
        setSampleGroup((p) => ({ ...p, availableIndicators: [] }));
      });
  }, [open, sampleGroup.sample_type_id]);

  const handleSave = async () => {
    if (!reportId) return;

    const samples = sampleGroup.sample_names
      .map((name, idx) => ({
        sample_id: sampleGroup.sample_ids[idx] ?? null,
        sample_type_id: sampleGroup.sample_type_id,
        sample_name: name.trim(),
        location: sampleGroup.location,
        sample_date: sampleGroup.sample_date,
        sampled_by: sampleGroup.sampled_by,
        indicators: sampleGroup.indicators.map((id) => ({ indicator_id: id })),
      }))
      .filter((s) => s.sample_name !== "");

    try {
      setSaving(true);
      await api.put(ENDPOINTS.REPORTS.EDIT(reportId!), {
        report_title: reportTitle,
        samples,
      });
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      logError(err, "Update report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Тайлан засах</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-sm text-muted-foreground">
            Ачаалж байна...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Тайлан</Label>
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Нэгдсэн төв ус гэх мэт..."
              />
            </div>

            <SampleFormSection
              sampleGroup={sampleGroup}
              setSampleGroup={setSampleGroup}
              sampleTypes={sampleTypes}
            />
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Болих
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
