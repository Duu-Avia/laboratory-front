"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type IndicatorRow = {
  sample_indicator_id: number;
  indicator_name: string;
  unit?: string;
  limit_value?: string;
  result_value?: string;
  is_detected?: boolean | null;
  is_within_limit?: boolean | null;
};

type SampleBlock = {
  sample_id: number;
  sample_name: string;
  location?: string;
  indicators: IndicatorRow[];
};

type FlatRow = {
    sample_id: number;
  sample_name: string;
  location: string | null;

  sample_indicator_id: number;
  indicator_name: string;
  unit: string | null;
  limit_value: string | null;

  result_value: string | null;
  is_detected: boolean | null;
  is_within_limit: boolean | null;
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const reportId = params?.id;

  // UI-only local state for inputs
  const [samples, setSamples] = useState<SampleBlock[]>([]);

  //object array ruu function
  function groupRowsToSamples(rows: FlatRow[]): SampleBlock[] {
  const map = new Map<number, SampleBlock>();

  for (const r of rows) {
    if (!map.has(r.sample_id)) {
      map.set(r.sample_id, {
        sample_id: r.sample_id,
        sample_name: r.sample_name,
        location: r.location ?? "",
        indicators: [],
      });
    }

    map.get(r.sample_id)!.indicators.push({
      sample_indicator_id: r.sample_indicator_id,
      indicator_name: r.indicator_name,
      unit: r.unit ?? "",
      limit_value: r.limit_value ?? "",
      // result_value: r.result_value ?? null,
      is_detected: r.is_detected ?? null,
      is_within_limit: r.is_within_limit ?? null,
    });
  }

  return Array.from(map.values());
}

  useEffect(()=>{
    if(!reportId) return;
    fetch(`http://localhost:8000/reports/${reportId}`)
    .then((res)=> res.json())
    .then((data)=>{const grouped = groupRowsToSamples(data.rows); setSamples(grouped)})
    .catch((err)=>console.log(`error while fetching data`))
  },[reportId])

  function updateResult(sample_indicator_id: number, patch: Partial<IndicatorRow>) {
    setSamples((prev) =>
      prev.map((s) => ({
        ...s,
        indicators: s.indicators.map((i) => (i.sample_indicator_id === sample_indicator_id ? { ...i, ...patch } : i)),
      }))
    );
  }
  console.log(samples)
  const onSave = async() => {
      const results = samples.flatMap((s) =>
      s.indicators.map((i) => ({
        sample_indicator_id: i.sample_indicator_id,
        result_value: i.result_value ?? null,
        is_detected: i.is_detected ?? null,
        is_within_limit: i.is_within_limit ?? null,
      }))
    );
    try{
      const response = await fetch(`http://localhost:8000/reports/results/${reportId}`,{
      method: "PUT",
      headers: {"Content-type": "application/json"},
      body: JSON.stringify({results})
    })
     const data = response.json()
     console.log(`saved data`, data)
    }catch(err){
      console.log(`failed to save`)
    }
  }

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

      <div className="space-y-4">
        {samples.map((s) => (
          <div key={s.sample_id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Badge variant="outline">Дээж #{s.sample_id}</Badge>
                <div className="text-lg font-semibold pt-6">{s.sample_name}</div>
                <div className="text-sm text-muted-foreground">{s.location || "-"}</div>
              </div>
            </div>

            <div className="mt-4 overflow-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left font-medium">Шинжилгээний нэр</th>
                    <th className="p-3 text-left font-medium w-[120px]">Зөвшөөрөгдөх хэмжээ</th>
                    <th className="p-3 text-left font-medium w-[160px]">Limit</th>
                    <th className="p-3 text-left font-medium w-[220px]">Result value</th>
                    <th className="p-3 text-left font-medium w-[160px]">Detected</th>
                    <th className="p-3 text-left font-medium w-[180px]">Within limit</th>
                  </tr>
                </thead>
                <tbody>
                  {s.indicators.map((i) => (
                    <tr key={i.sample_indicator_id} className="border-t">
                      <td className="p-3">{i.indicator_name}</td>
                      <td className="p-3 text-muted-foreground">{i.unit || "-"}</td>
                      <td className="p-3 text-muted-foreground">{i.limit_value || "-"}</td>

                      <td className="p-3">
                        <Input
                          value={i.result_value ?? ""}
                          onChange={(e) => updateResult(i.sample_indicator_id, { result_value: e.target.value })}
                          placeholder="Enter result"
                        />
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={i.is_detected === true ? "default" : "outline"}
                            onClick={() => updateResult(i.sample_indicator_id, { is_detected: true })}
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={i.is_detected === false ? "default" : "outline"}
                            onClick={() => updateResult(i.sample_indicator_id, { is_detected: false })}
                          >
                            No
                          </Button>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={i.is_within_limit === true ? "default" : "outline"}
                            onClick={() => updateResult(i.sample_indicator_id, { is_within_limit: true })}
                          >
                            Pass
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={i.is_within_limit === false ? "default" : "outline"}
                            onClick={() => updateResult(i.sample_indicator_id, { is_within_limit: false })}
                          >
                            Fail
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              You’ll replace the mock data with your fetched report detail (samples + indicators + test results).
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
