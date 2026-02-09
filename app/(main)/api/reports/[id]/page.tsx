"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { SampleColumn } from "@/types";
import { ReportHeader } from "../_components/ReportHeader";
import { SampleBadges } from "../_components/SampleBadges";
import { ResultsTable } from "../_components/ResultTable";
import type { IndicatorGroup } from "../_components/ResultTable";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError } from "@/lib/errors";
import { CheckCircle2, AlertTriangle } from "lucide-react";
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

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const reportId = params?.id;
  const router = useRouter();

  const [samples, setSamples] = useState<SampleColumn[]>([]);
  const [reportTitle, setReportTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Indicator-grouped view (derived from samples state)
  const indicatorGroups = useMemo(() => groupByIndicator(samples), [samples]);

  // Normalize result fields so table can use ind.result_value directly
  function normalizeSamples(rawSamples: SampleColumn[]) {
    return (rawSamples ?? []).map((s) => ({
      ...s,
      indicators: (s.indicators ?? []).map((it: any) => ({
        ...it,
        result_value: it.result?.result_value ?? it.result_value ?? null,
        is_detected: it.result?.is_detected ?? it.is_detected ?? null,
        is_within_limit:
          it.result?.is_within_limit ?? it.is_within_limit ?? null,
        avg: it.avg ?? it.result?.avg ?? null,
      })),
    }));
  }

  useEffect(() => {
    api
      .get<{ samples: SampleColumn[]; report_title: string }>(
        ENDPOINTS.REPORTS.DETAIL(reportId)
      )
      .then((data) => {
        setSamples(normalizeSamples(data.samples));
        setReportTitle(data.report_title);
      })
      .catch((err) => logError(err, "Fetch report details"));
  }, [reportId]);

  // Update one indicator by sample_indicator_id (unique)
  function updateSampleIndicator(sampleIndicatorId: number, patch: any) {
    setSamples((prev) =>
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

  // Show confirmation dialog
  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  // Actually save the results
  const confirmSave = async () => {
    const results: any[] = [];

    samples.forEach((s: any) => {
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
      setShowConfirmDialog(false);
      await api.put(ENDPOINTS.REPORTS.RESULTS(reportId!), { results });
      setSaveSuccess(true);

      // Redirect to main page after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      logError(err, "Save report results");
      setSaving(false);
    }
  };

  const handleExport = () => {
    console.log("excel export shvv");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Success Alert */}
        {saveSuccess && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-6 shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-400">
                  Амжилттай хадгалагдлаа!
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-0.5">
                  Шинжилгээний үр дүн амжилттай хадгалагдлаа. Үндсэн хуудас руу шилжиж байна...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                </div>
                <AlertDialogTitle className="text-xl">
                  Шинжилгээний үр дүнг хадгалах уу?
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-base mt-4">
                Та шинжилгээний үр дүнг зөв оруулсан эсэхээ шалгана уу. Хадгалсны дараа
                энэ үйлдлийг буцаах боломжгүй болохыг анхаарна уу.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-200 dark:border-slate-800">
                Болих
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmSave}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Тийм, хадгалах
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Header */}
        <ReportHeader
          reportId={reportId || ""}
          onSave={handleSaveClick}
          onExport={handleExport}
          saving={saving}
        />

        {/* Sample Badges */}
        <SampleBadges reportTitle={reportTitle} samples={samples} />

        {/* Results Table - grouped by indicator */}
        {samples.length > 0 && (
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <ResultsTable
              indicatorGroups={indicatorGroups}
              onUpdateIndicator={updateSampleIndicator}
            />
          </div>
        )}
      </div>
    </div>
  );
}
