"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SampleFormSection } from "./SampleFormSection";
import type { Indicator, SampleGroup, SampleGroupEdit, SampleType } from "../types/types";



const emptySampleGroup: SampleGroup = {
  sample_type_id: null,
  sample_ids: [],
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

export function EditReport({ open, onOpenChange, reportId, sampleTypes, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [sampleGroup, setSampleGroup] = useState<SampleGroup>(emptySampleGroup);

  // Debug: log sampleGroup changes
  useEffect(() => {
    console.log("sampleGroup changed:", {
      sample_names: sampleGroup.sample_names,
      sample_ids: sampleGroup.sample_ids,
    });
  }, [sampleGroup.sample_names, sampleGroup.sample_ids]);

  // Fetch report data when modal opens
  useEffect(() => {
    if (!open || !reportId) return;

    setLoading(true);

    fetch(`http://localhost:8000/reports/${reportId}`)
      .then((r) => r.json())
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

        console.log("=== LOADED FROM API ===");
        console.log("names:", loadedNames);
        console.log("ids:", loadedIds);

        setSampleGroup({
          sample_type_id: first?.sample_type_id ?? null,
          sample_ids: loadedIds,
          sample_names: loadedNames.length ? loadedNames : [""],
          location: first?.location ?? "",
          sample_date: (first?.sample_date ?? "").slice(0, 10),
          sampled_by: first?.sampled_by ?? "",
          indicators: Array.from(selectedIndicators),
          availableIndicators: [],
        });
      })
      .catch((e) => console.error("Error fetching report:", e))
      .finally(() => setLoading(false));
  }, [open, reportId]);

  // Load available indicators when sample type changes
  useEffect(() => {
    if (!open || !sampleGroup.sample_type_id) {
      return;
    }

    fetch(`http://localhost:8000/sample/indicators/${sampleGroup.sample_type_id}`)
      .then((r) => r.json())
      .then((indicators: Indicator[]) => {
        setSampleGroup((p) => ({ ...p, availableIndicators: indicators }));
      })
      .catch(() => {
        setSampleGroup((p) => ({ ...p, availableIndicators: [] }));
      });
  }, [open, sampleGroup.sample_type_id]);

  const handleSave = async () => {
    if (!reportId) return;

    console.log("=== SAVE CLICKED ===");
    console.log("sample_names:", sampleGroup.sample_names);
    console.log("sample_ids:", sampleGroup.sample_ids);

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

    console.log("Payload samples:", samples.map(s => ({ sample_id: s.sample_id, sample_name: s.sample_name })));

    try {
      setSaving(true);

      const res = await fetch(`http://localhost:8000/reports/edit/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_title: reportTitle, samples }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Update failed:", err);
        return;
      }

      onSaved?.();
      onOpenChange(false);
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
          <div className="py-6 text-sm text-muted-foreground">Ачаалж байна...</div>
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
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>
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
