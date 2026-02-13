"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SampleFormSection } from "./SampleFormSection";
import {
  ResultsTable,
  type IndicatorGroup,
} from "@/app/(main)/api/reports/_components/ResultTable";
import type { Indicator, SampleGroup, SampleColumn, LabType } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError } from "@/lib/errors";

const emptySampleGroup: SampleGroup = {
  lab_type_id: null,
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
  labTypes: LabType[];
  onSaved?: () => void;
};

/** Normalize result fields so we can use ind.result_value directly */
function normalizeSamples(rawSamples: any[]): SampleColumn[] {
  return (rawSamples ?? []).map((s: any) => ({
    ...s,
    indicators: (s.indicators ?? []).map((it: any) => ({
      ...it,
      result_value: it.result?.result_value ?? it.result_value ?? null,
      is_detected: it.result?.is_detected ?? it.is_detected ?? null,
      is_within_limit: it.result?.is_within_limit ?? it.is_within_limit ?? null,
      avg: it.avg ?? it.result?.avg ?? null,
    })),
  }));
}

/** Transform sample-grouped data into indicator-grouped data */
function groupByIndicator(samples: SampleColumn[]): IndicatorGroup[] {
  const map = new Map<number, IndicatorGroup>();
  const order: number[] = [];

  for (const sample of samples) {
    for (const ind of sample.indicators as any[]) {
      if (!map.has(ind.indicator_id)) {
        order.push(ind.indicator_id);
        map.set(ind.indicator_id, {
          indicator_id: ind.indicator_id,
          indicator_name: ind.indicator_name,
          unit: ind.unit ?? null,
          limit_value: ind.limit_value ?? null,
          input_type: ind.input_type,
          test_method: ind.test_method ?? null,
          sampleResults: [],
        });
      }
      map.get(ind.indicator_id)!.sampleResults.push({
        sample_id: sample.sample_id,
        sample_name: sample.sample_name,
        sample_indicator_id: ind.sample_indicator_id,
        result_value: ind.result_value ?? null,
        is_detected: ind.is_detected ?? null,
        is_within_limit: ind.is_within_limit ?? null,
        avg: ind.avg ?? null,
      });
    }
  }

  return order.map((id) => map.get(id)!);
}

export function EditReport({
  open,
  onOpenChange,
  reportId,
  labTypes,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [sampleGroup, setSampleGroup] = useState<SampleGroup>(emptySampleGroup);
  const [rawSamples, setRawSamples] = useState<SampleColumn[]>([]);

  // Indicator-grouped view for results table
  const indicatorGroups = useMemo(
    () => groupByIndicator(rawSamples),
    [rawSamples]
  );
  const hasResults = indicatorGroups.length > 0;

  // Reset state when dialog closes so indicators fetch properly on next open
  useEffect(() => {
    if (!open) {
      setSampleGroup(emptySampleGroup);
      setReportTitle("");
      setRawSamples([]);
      setSaveSuccess(false);
    }
  }, [open]);

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

        // Store normalized samples for results editing
        setRawSamples(normalizeSamples(samples));

        const selectedIndicators = new Set<number>();
        for (const s of samples) {
          for (const ind of s.indicators ?? []) {
            selectedIndicators.add(ind.indicator_id);
          }
        }

        const loadedNames = samples.map((s: any) => s.sample_name);
        const loadedIds = samples.map((s: any) => s.sample_id);

        setSampleGroup({
          lab_type_id: first?.lab_type_id ?? null,
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
    if (!open || !sampleGroup.lab_type_id) {
      return;
    }

    api
      .get<Indicator[]>(
        ENDPOINTS.INDICATORS.BY_LAB_TYPE(sampleGroup.lab_type_id)
      )
      .then((indicators) => {
        setSampleGroup((p) => ({ ...p, availableIndicators: indicators }));
      })
      .catch(() => {
        setSampleGroup((p) => ({ ...p, availableIndicators: [] }));
      });
  }, [open, sampleGroup.lab_type_id]);

  // Update one indicator result by sample_indicator_id
  function updateSampleIndicator(sampleIndicatorId: number, patch: any) {
    setRawSamples((prev) =>
      prev.map((s) => ({
        ...s,
        indicators: (s.indicators ?? []).map((ind: any) =>
          ind.sample_indicator_id === sampleIndicatorId
            ? { ...ind, ...patch }
            : ind
        ),
      }))
    );
  }

  const checkIsComplete = () => {
    return rawSamples.every((s: any) =>
      (s.indicators ?? []).every((ind: any) => {
        const isCfu = ind.unit?.toLowerCase().includes("cfu") ?? false;
        if (isCfu) {
          if (!ind.result_value) return false;
          try {
            const parsed = JSON.parse(ind.result_value);
            return parsed.temp22 !== "" && parsed.temp37 !== "";
          } catch {
            return false;
          }
        }
        return ind.is_detected !== null && ind.is_detected !== undefined;
      })
    );
  };

  const handleSaveClick = () => {
    if (hasResults && !checkIsComplete()) {
      setShowIncompleteWarning(true);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleSave = async () => {
    if (!reportId) return;

    const samples = sampleGroup.sample_names
      .map((name, idx) => ({
        sample_id: sampleGroup.sample_ids[idx] ?? null,
        lab_type_id: sampleGroup.lab_type_id,
        sample_name: name.trim(),
        sample_amount: sampleGroup.sample_amount,
        location: sampleGroup.location,
        sample_date: sampleGroup.sample_date,
        sampled_by: sampleGroup.sampled_by,
        indicators: sampleGroup.indicators.map((id) => ({ indicator_id: id })),
      }))
      .filter((s) => s.sample_name !== "");

    // Collect results from rawSamples
    const results: any[] = [];
    rawSamples.forEach((s: any) => {
      (s.indicators ?? []).forEach((ind: any) => {
        results.push({
          sample_indicator_id: ind.sample_indicator_id,
          result_value: ind.result_value ?? null,
          avg: ind.avg ?? null,
          is_detected: ind.is_detected ?? null,
          is_within_limit: ind.is_within_limit ?? null,
        });
      });
    });

    try {
      setSaving(true);

      // Save report info
      await api.put(ENDPOINTS.REPORTS.EDIT(reportId!), {
        report_title: reportTitle,
        samples,
      });

      // Save results if there are any
      if (results.length > 0) {
        await api.put(ENDPOINTS.REPORTS.RESULTS(reportId!), {
          results,
          is_complete: checkIsComplete(),
        });
      }

      setSaveSuccess(true);

      // Show success briefly, then close
      setTimeout(() => {
        setSaveSuccess(false);
        onSaved?.();
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      logError(err, "Update report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Тайлан засах</DialogTitle>
        </DialogHeader>

        {saveSuccess && (
          <div className="mx-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900">
                  Амжилттай хадгалагдлаа!
                </h3>
                <p className="text-xs text-emerald-700">
                  Тайлангийн мэдээлэл амжилттай шинэчлэгдлээ.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-6 text-sm text-muted-foreground">
              Ачаалж байна...
            </div>
          ) : (
            <div className="space-y-4">
              <SampleFormSection
                sampleGroup={sampleGroup}
                setSampleGroup={setSampleGroup}
                labTypes={labTypes}
              />

              {/* Results editing section */}
              {hasResults && (
                <div className="rounded-xl border border-modal-section-border bg-modal-section-bg/50 p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-modal-accent/10">
                      <svg
                        className="h-4 w-4 text-modal-accent"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Шинжилгээний үр дүн
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Үр дүнг засварлах
                      </p>
                    </div>
                  </div>

                  <ResultsTable
                    indicatorGroups={indicatorGroups}
                    onUpdateIndicator={updateSampleIndicator}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Болих
          </Button>
          <Button onClick={handleSaveClick} disabled={saving || loading}>
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Тайлан хадгалах уу?</AlertDialogTitle>
            <AlertDialogDescription>
              Та өөрчлөлтөө зөв оруулсан эсэхээ шалгана уу.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Болих</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false);
                handleSave();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Тийм, хадгалах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showIncompleteWarning}
        onOpenChange={setShowIncompleteWarning}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Шинжилгээний үр дүн дутуу байна!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Зарим шинжилгээний үр дүн бөглөгдөөгүй байна. Хадгалбал тайлангийн
              төлөв <strong>&quot;дутуу&quot;</strong> болж өөрчлөгдөнө.
              Үргэлжлүүлэх үү?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Болих</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowIncompleteWarning(false);
                handleSave();
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Тийм, хадгалах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
