"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FlatRow, IndicatorRow, SampleColumn } from "@/app/types/types";
import { ReportHeader } from "../_components/ReportHeader";
import { SampleBadges } from "../_components/SampleBadges";
import { ResultsTable } from "../_components/ResultTable";


export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const reportId = params?.id;
  const [samples, setSamples] = useState<SampleColumn[]>([]);
  const [indicators, setIndicators] = useState<IndicatorRow[]>([]);
  const [reportTitle, setReportTitle] = useState("");

  function restructureData(rows: FlatRow[]) {
    const sampleMap = new Map<number, SampleColumn>();
    const indicatorMap = new Map<number, IndicatorRow>();

    for (const r of rows) {
      if (!sampleMap.has(r.sample_id)) {
        sampleMap.set(r.sample_id, {
          sample_id: r.sample_id,
          sample_name: r.sample_name,
          location: r.location ?? "",
        });
      }

      if (!indicatorMap.has(r.indicator_id)) {
        indicatorMap.set(r.indicator_id, {
          indicator_id: r.indicator_id,
          indicator_name: r.indicator_name,
          unit: r.unit ?? "",
          limit_value: r.limit_value ?? "",
          sample_indicator_ids: [],
          result_value: r.result_value ?? "",
          is_detected: r.is_detected ?? null,
          is_within_limit: r.is_within_limit ?? null,
        });
      }

      const indicator = indicatorMap.get(r.indicator_id)!;
      indicator.sample_indicator_ids.push(r.sample_indicator_id);
    }

    setSamples(Array.from(sampleMap.values()));
    setIndicators(Array.from(indicatorMap.values()));
  }

  useEffect(() => {
    if (!reportId) return;
    fetch(`http://localhost:8000/reports/${reportId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.rows && data.rows.length > 0) {
          setReportTitle(data.rows[0].report_title || "");
        }
        restructureData(data.rows);
      })
      .catch((err) => console.log(`error while fetching data`));
  }, [reportId]);

  function updateIndicator(indicatorId: number, patch: Partial<IndicatorRow>) {
    setIndicators((prev) =>
      prev.map((ind) => (ind.indicator_id === indicatorId ? { ...ind, ...patch } : ind))
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
      const response = await fetch(`http://localhost:8000/reports/results/${reportId}`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ results }),
      });
      const data = await response.json();
      console.log(`saved data`, data);
    } catch (err) {
      console.log(`failed to save`, err);
    }
  };

  const handleExport = () => {
    console.log("export pdf (ui only)");
  };

  return (
    <div className="p-6 space-y-5">
      <ReportHeader reportId={reportId || ""} onSave={onSave} onExport={handleExport} />
      <div className="rounded-xl border p-4">
        <SampleBadges reportTitle={reportTitle} samples={samples} />
        <ResultsTable indicators={indicators} onUpdateIndicator={updateIndicator} />
      </div>
    </div>
  );
}