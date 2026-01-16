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
  const [indicators, setIndicators] = useState<IndicatorRow[]>([]);
  const [reportTitle, setReportTitle] = useState("");

  function buildIndicatorRows(samples: SampleColumn[]): IndicatorRow[] {
    const indicatorMap = new Map<number, IndicatorRow>();

    for (const sample of samples) {
      for (const it of sample.indicators ?? []) {
        if (!indicatorMap.has(it.indicator_id)) {
          indicatorMap.set(it.indicator_id, {
            indicator_id: it.indicator_id,
            indicator_name: it.indicator_name,
            unit: it.unit ?? "",
            limit_value: it.limit_value ?? "",
            sample_indicator_ids: [],
            result_value: it.result?.result_value ?? "",
            is_detected: it.result?.is_detected ?? null,
            is_within_limit: it.result?.is_within_limit ?? null,
          });
        }

        indicatorMap
          .get(it.indicator_id)!
          .sample_indicator_ids.push(it.sample_indicator_id);
      }
    }

    return Array.from(indicatorMap.values());
  }

  useEffect(() => {
    if (!reportId) return;

    fetch(`http://localhost:8000/reports/${reportId}`)
      .then((res) => res.json())
      .then((data) => {
        setReportTitle(data.report?.report_title ?? "");
        setSamples(data.samples ?? []);
        setIndicators(buildIndicatorRows(data.samples ?? []));
      })
      .catch(() => console.log("error while fetching report detail"));
  }, [reportId]);

  function updateIndicator(indicatorId: number, patch: Partial<IndicatorRow>) {
    setIndicators((prev) =>
      prev.map((ind) =>
        ind.indicator_id === indicatorId ? { ...ind, ...patch } : ind
      )
    );
  }

  const onSave = async () => {
    const results: any[] = [];

    indicators.forEach((ind) => {
      ind.sample_indicator_ids.forEach((sample_indicator_id) => {
        results.push({
          sample_indicator_id,
          result_value: ind.result_value ?? null,
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
        <ResultsTable
          indicators={indicators}
          onUpdateIndicator={updateIndicator}
        />
      </div>
    </div>
  );
}
