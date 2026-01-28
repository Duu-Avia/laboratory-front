"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IndicatorRow, SampleColumn } from "@/app/types/types";
import { ReportHeader } from "../_components/ReportHeader";
import { SampleBadges } from "../_components/SampleBadges";
import { ResultsTable } from "../_components/ResultTable";

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const reportId = params?.id;

  const [samples, setSamples] = useState<SampleColumn[]>([]);
  const [reportTitle, setReportTitle] = useState("");

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
    if (!reportId) return;

    fetch(`http://localhost:8000/reports/${reportId}`)
      .then((res) => res.json())
      .then((data) => {
        setReportTitle(data.report?.report_title ?? "");
        setSamples(normalizeSamples(data.samples ?? []));
      })
      .catch(() => console.log("error while fetching report detail"));
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

  const onSave = async () => {
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
      const response = await fetch(
        `http://localhost:8000/reports/results/${reportId}`,
        {
          method: "PUT",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ results }),
        }
      );

      const data = await response.json();
      console.log("saved data", data);
    } catch (err) {
      console.log("failed to save", err);
    }
  };

  const handleExport = () => {
    console.log("excel export shvv");
  };

  return (
    <div className="p-6 space-y-5">
      <ReportHeader
        reportId={reportId || ""}
        onSave={onSave}
        onExport={handleExport}
      />

      <div className="rounded-xl border p-4">
        <SampleBadges reportTitle={reportTitle} samples={samples} />
      </div>

      <div className="space-y-6">
        {samples.map((s: any) => (
          <div key={s.sample_id} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{s.sample_name}</div>
                <div className="text-sm text-muted-foreground">
                  {s.sample_amount || "-"} Дээж авсан • {s.sampled_by || "-"}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Дээж: {s.sample_id}
              </div>
            </div>

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
  );
}
