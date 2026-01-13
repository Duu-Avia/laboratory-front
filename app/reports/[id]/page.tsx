"use client";
import {useEffect, useState} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FlatRow, IndicatorRow, SampleColumn } from "@/app/_components/types/types";

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
    // Each indicator's result applies to ALL its sample_indicator_ids
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

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">
            <Link href="/reports" className="hover:underline">
              Reports
            </Link>{" "}
            / #{reportId}
          </div>
          <div className="text-2xl font-semibold">Үр дүн оруулах</div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => console.log("export pdf (ui only)")}>
            Export PDF
          </Button>
          <Button onClick={onSave}>Save results</Button>
        </div>
      </div>

      <Separator />

      <div className="rounded-xl border p-4">
        <div className="mb-4">
          <div className="text-[100px] font-semibold">{reportTitle}</div>
          <div className="flex gap-2 mt-2">
            {samples.map((s,index) => (
              <Badge className="text-[15px]" key={s.sample_id} variant="outline">
                Дээж-{index + 1} {s.sample_name}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium">Шинжилгээний нэр</th>
                <th className="p-3 text-left font-medium w-[140px]">Зөвшөөрөгдөх хэмжээ</th>
                <th className="p-3 text-left font-medium w-[140px]">Limit</th>
                <th className="p-3 text-left font-medium w-[200px]">Шинжилгээний хариу</th>
                <th className="p-3 text-center font-medium w-[140px]">Илэрсэн/илэрээгүй</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((ind) => (
                <tr key={ind.indicator_id} className="border-t">
                  <td className="p-3">{ind.indicator_name}</td>
                  <td className="p-3 text-muted-foreground">{ind.unit || "-"}</td>
                  <td className="p-3 text-muted-foreground">{ind.limit_value || "-"}</td>
                  
                  <td className="p-3">
                    <Input
                      value={ind.result_value ?? ""}
                      onChange={(e) => updateIndicator(ind.indicator_id, { result_value: e.target.value })}
                      placeholder="Enter result"
                    />
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        size="sm"
                        variant={ind.is_detected === true ? "default" : "outline"}
                        onClick={() => updateIndicator(ind.indicator_id, { is_detected: true })}
                      >
                        Илэрсэн
                      </Button>
                    
                      <Button
                        type="button"
                        size="sm"
                        variant={ind.is_within_limit === false ? "default" : "outline"}
                        onClick={() => updateIndicator(ind.indicator_id, { is_within_limit: false })}
                      >
                        Илэрээгүй
                      </Button>
                 
                    </div>
                  </td>
                  <td className="p-3">
                 
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}