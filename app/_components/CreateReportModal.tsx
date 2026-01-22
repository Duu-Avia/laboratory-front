"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SampleFormSection } from "./SampleFormSection";
import type { CreateReportModalProps, Indicator, SampleGroup } from "../types/types";


const getEmptySampleGroup = (defaultDate: string): SampleGroup => ({
  sample_type_id: null,
  sample_ids:[],
  sample_names: [""],
  location: "",
  sample_date: defaultDate,
  sample_amount:"",
  sampled_by: "",
  indicators: [],
  availableIndicators: [],
});

export function CreateReportModal({ open, onOpenChange, sampleTypes, from, to, onCreated }: CreateReportModalProps) {
  const [saving, setSaving] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportTitleTouched, setReportTitleTouched] = useState(false);
  const [sampleGroup, setSampleGroup] = useState<SampleGroup>(getEmptySampleGroup(from));

  const calculateTestEndDate = (startDate:string) =>{
  const endTestDate = new Date(startDate);
  endTestDate.setDate(endTestDate.getDate() + 3)
  return endTestDate.toISOString().slice(0, 10);
  }

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setReportTitle("");
      setReportTitleTouched(false)
      setSampleGroup(getEmptySampleGroup(to));
    }
  }, [open, to]);

//location ororchlogdoh burt report title supdate hiih
  useEffect(() => {
  if (!open) return;
  if (reportTitleTouched) return;

  setReportTitle(sampleGroup.location || "");
}, [open, sampleGroup.location, reportTitleTouched]);


  // Load available indicators when sample type changes
  useEffect(() => {
    if (!open || !sampleGroup.sample_type_id) return;
    
    fetch(`http://localhost:8000/sample/indicators/${sampleGroup.sample_type_id}`)
      .then((response) => response.json())
      .then((indicators: Indicator[]) => {
        setSampleGroup((p) => ({ ...p, availableIndicators: indicators, indicators:indicators.map((ind)=>ind.id) }));
      })
      .catch(() => {
        setSampleGroup((p) => ({ ...p, availableIndicators: [] }));
      });
  }, [open, sampleGroup.sample_type_id]);

  const handleSave = async () => {
    const samples = sampleGroup.sample_names
      .filter((name) => name.trim() !== "")
      .map((name) => ({
        sample_type_id: sampleGroup.sample_type_id,
        sample_name: name.trim(),
        sample_amount:sampleGroup.sample_amount,
        location: sampleGroup.location,
        sample_date: sampleGroup.sample_date,
        sampled_by: sampleGroup.sampled_by,
        indicators: sampleGroup.indicators,
      }));

    if (samples.length === 0) {
      alert("Дор хаяж нэг дээж нэмнэ үү");
      return;
    }

    if (!sampleGroup.sample_type_id) {
      alert("Дээжний төрөл сонгоно уу");
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
      setSaving(true);

      const res = await fetch(`http://localhost:8000/reports/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onCreated?.();
        onOpenChange(false);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("Create failed:", err);
      }
    } catch (error) {
      console.error("Error creating report:", error);
    } finally {
      setSaving(false);
    }
  };
  console.log(sampleGroup.location,"location")
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
              onChange={(e) => {setReportTitleTouched(true);
                setReportTitle(e.target.value)
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
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>
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