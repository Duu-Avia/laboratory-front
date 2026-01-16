"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SampleFormSection } from "./SampleFormSection";

export function CreateReportModal({
  open,
  onOpenChange,
  sampleTypes,
  from,
  to,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sampleTypes: any[];
  from: string;
  to: string;
  onCreated?: () => void;
}) {
  const [reportTitle, setReportTitle] = useState("");
  const [sampleGroup, setSampleGroup] = useState<any>({
    sample_type_id: null,
    sample_names: [""],
    location: "",
    sample_date: from,
    sampled_by: "",
    indicators: [],
    availableIndicators: [],
  });

  useEffect(() => {
    if (!open) return;
    // reset each time modal opens if you want
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!sampleGroup.sample_type_id) {
      setSampleGroup((p: any) => ({ ...p, availableIndicators: [] }));
      return;
    }
    fetch(`http://localhost:8000/sample/indicators/${sampleGroup.sample_type_id}`)
      .then((r) => r.json())
      .then((inds) => setSampleGroup((p: any) => ({ ...p, availableIndicators: inds })))
      .catch(() => setSampleGroup((p: any) => ({ ...p, availableIndicators: [] })));
  }, [open, sampleGroup.sample_type_id]);

  const onSave = async () => {
    const samples = sampleGroup.sample_names
      .filter((name: string) => name.trim() !== "")
      .map((name: string) => ({
        sample_type_id: sampleGroup.sample_type_id,
        sample_name: name.trim(),
        location: sampleGroup.location,
        sample_date: sampleGroup.sample_date,
        sampled_by: sampleGroup.sampled_by,
        indicators: sampleGroup.indicators,
      }));

    const payload = {
      report_title: reportTitle,
      test_start_date: from,
      test_end_date: to,
      analyst: "",
      approved_by: "",
      samples,
    };

    const res = await fetch(`http://localhost:8000/reports/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onCreated?.();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Шинэ хүсэлт</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Тайлан</Label>
            <Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Нэгдсэн төв ус гэх мэт..." />
          </div>

          <SampleFormSection sampleGroup={sampleGroup} setSampleGroup={setSampleGroup} sampleTypes={sampleTypes} />
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
