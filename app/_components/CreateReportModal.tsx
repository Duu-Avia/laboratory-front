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
import { motion, AnimatePresence } from "framer-motion";
import { FileText, AlertCircle, Loader2, Save, X } from "lucide-react";

// Types - use @/types instead of relative path
import type {
  CreateReportModalProps,
  Indicator,
  SampleGroup,
} from "@/types";

// Lib - use new API client and error handling
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage, logError } from "@/lib/errors";
import { reportValidation } from "@/lib/validators";

const getEmptySampleGroup = (defaultDate: string): SampleGroup => ({
  lab_type_id: null,
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
  labTypes,
  from,
  to,
  onCreated,
}: CreateReportModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);
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
      setError(null);
      setNextId(null);
      // Auto-set lab type if user has only one
      const autoLabTypeId = labTypes.length === 1 ? labTypes[0].id : null;
      setSampleGroup({
        ...getEmptySampleGroup(to),
        lab_type_id: autoLabTypeId,
      });
      // Fetch next report ID
      api
        .get<{ next_id: string }>(ENDPOINTS.REPORTS.NEXT_ID)
        .then((data) => setNextId(data.next_id))
        .catch((err) => logError(err, "Fetch next report ID"));
    }
  }, [open, to, labTypes]);

  // Update report title when location changes
  useEffect(() => {
    if (!open) return;
    if (reportTitleTouched) return;
    setReportTitle(sampleGroup.location || "");
  }, [open, sampleGroup.location, reportTitleTouched]);

  // Load available indicators when sample type changes
  useEffect(() => {
    if (!open || !sampleGroup.lab_type_id) return;

    api
      .get<Indicator[]>(
        ENDPOINTS.INDICATORS.BY_LAB_TYPE(sampleGroup.lab_type_id)
      )
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
  }, [open, sampleGroup.lab_type_id]);

  const handleSave = async () => {
    // Validate with zod
    const result = reportValidation.safeParse({
      reportTitle,
      labTypeId: sampleGroup.lab_type_id ?? 0,
      sampleNames: sampleGroup.sample_names,
      sampled_by: sampleGroup.sampled_by,
      sample_amount: sampleGroup.sample_amount,
      indicatorNames: sampleGroup.indicators,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Мэдээллээ шалгана уу");
      return;
    }

    const samples = sampleGroup.sample_names
      .filter((name) => name.trim() !== "")
      .map((name) => ({
        lab_type_id: sampleGroup.lab_type_id,
        sample_name: name.trim(),
        sample_amount: sampleGroup.sample_amount,
        location: sampleGroup.location,
        sample_date: sampleGroup.sample_date,
        sampled_by: sampleGroup.sampled_by,
        indicators: sampleGroup.indicators,
      }));

    const payload = {
      report_title: reportTitle || sampleGroup.location || "",
      test_start_date: sampleGroup.sample_date,
      test_end_date: calculateTestEndDate(sampleGroup.sample_date),
      approved_by: "",
      samples,
    };

    try {
      setError(null);
      setSaving(true);
      await api.post(ENDPOINTS.REPORTS.CREATE, payload);
      onCreated?.();
      onOpenChange(false);
    } catch (err) {
      logError(err, "Create report");
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden border-modal-section-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="bg-modal-header-bg px-6 py-5 border-b border-modal-section-border">
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-modal-accent/10">
              <FileText className="h-5 w-5 text-modal-accent" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Шинэ сорьц
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
               Үүсгэх сорьцын мэдээллийг бөглөнө үү
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Body - scrollable */}
        <div className="overflow-y-auto modal-scrollbar px-6 py-5 space-y-5 max-h-[calc(90vh-160px)]">
{nextId && (
            <div className="flex justify-center mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                №: <span className="text-foreground">{nextId}</span>
              </span>
            </div>
          )}
          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 rounded-xl bg-modal-error-light border border-modal-error/20 p-4"
              >
                <AlertCircle className="h-5 w-5 text-modal-error shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-modal-error">Алдаа гарлаа</p>
                  <p className="text-sm text-modal-error/80 mt-0.5">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-modal-error/60 hover:text-modal-error transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Report Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="space-y-2"
          >
            
          </motion.div>

          {/* Sample Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <SampleFormSection
              sampleGroup={sampleGroup}
              setSampleGroup={setSampleGroup}
              labTypes={labTypes}
            />
          </motion.div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-modal-header-bg border-t border-modal-section-border px-6 py-4">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="h-10 px-5 border-modal-section-border hover:bg-modal-section-bg transition-all duration-200"
            >
              Болих
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-6 bg-modal-accent text-modal-accent-foreground hover:bg-modal-accent/90 shadow-sm transition-all duration-200"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Хадгалж байна...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Хадгалах
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

