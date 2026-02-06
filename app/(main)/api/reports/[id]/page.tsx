"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IndicatorRow, SampleColumn } from "@/types";
import { ReportHeader } from "../_components/ReportHeader";
import { SampleBadges } from "../_components/SampleBadges";
import { ResultsTable } from "../_components/ResultTable";
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

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const reportId = params?.id;
  const router = useRouter();

  const [samples, setSamples] = useState<SampleColumn[]>([]);
  const [reportTitle, setReportTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  //Normalize result fields so table can use ind.result_value directly
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
      <div className="max-w-7xl mx-auto space-y-6">
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

        {/* Results by Sample */}
        <div className="space-y-6">
          {samples.map((s: any, index: number) => (
            <div
              key={s.sample_id}
              className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Sample Header */}
              <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-purple-950/50 border border-emerald-200 dark:border-purple-900">
                    <span className="text-sm font-bold text-gray-600 dark:text-purple-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {s.sample_name}
                    </h3>
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                  ID: {s.sample_id}
                </div>
              </div>

              {/* Results Table */}
              <ResultsTable
                indicators={s.indicators ?? []}
                onUpdateIndicator={(sampleIndicatorId, patch) =>
                  updateSampleIndicator(sampleIndicatorId, patch)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
