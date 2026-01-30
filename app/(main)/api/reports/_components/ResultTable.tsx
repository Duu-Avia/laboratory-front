import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { IndicatorRow } from "@/types";

function parseCfuValue(resultValue: string | null | undefined) {
  if (!resultValue) return { temp22: "", temp37: "", average: "" };
  try {
    return JSON.parse(resultValue);
  } catch {
    return { temp22: "", temp37: "", average: "" };
  }
}

type TableIndicator = {
  sample_indicator_id: number;
  indicator_id: number;
  indicator_name: string;
  unit?: string | null;
  limit_value?: string | null;
  input_type: "cfu" | string;
  result_value?: string | null;
  avg?: string | null;
  is_detected?: boolean | null;
  is_within_limit?: boolean | null;
};

type ResultsTableProps = {
  indicators: TableIndicator[];
  onUpdateIndicator: (
    sampleIndicatorId: number,
    patch: Partial<TableIndicator>
  ) => void;
};

export function ResultsTable({
  indicators,
  onUpdateIndicator,
}: ResultsTableProps) {
  const handleCfuChange = (
    sampleIndicatorId: number,
    currentValue: string | null | undefined,
    field: "temp22" | "temp37" | "average",
    newValue: string
  ) => {
    const current = parseCfuValue(currentValue);
    const updated: any = { ...current, [field]: newValue };

    if (field === "temp22" || field === "temp37") {
      const t22 = parseFloat(updated.temp22) || 0;
      const t37 = parseFloat(updated.temp37) || 0;
      if (updated.temp22 !== "" || updated.temp37 !== "") {
        updated.average = String(Math.round((t22 + t37) / 2));
      }
    }

    onUpdateIndicator(sampleIndicatorId, {
      result_value: JSON.stringify(updated),
      avg: updated.average,
    });
  };

  return (
    <div className="overflow-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3 text-left font-medium">Шинжилгээний нэр</th>
            <th className="p-3 text-left font-medium w-[140px]">Нэгж</th>
            <th className="p-3 text-left font-medium w-[140px]">Limit</th>
            <th className="p-3 text-left font-medium">Шинжилгээний хариу</th>
          </tr>
        </thead>
        <tbody>
          {indicators.map((ind) => {
            const isCfu = ind.unit?.toLowerCase().includes("cfu");
            const cfuData = isCfu ? parseCfuValue(ind.result_value) : null;

            return (
              <tr key={ind.sample_indicator_id} className="border-t">
                <td className="p-3">{ind.indicator_name}</td>
                <td className="p-3 text-muted-foreground">{ind.unit || "-"}</td>
                <td className="p-3 text-muted-foreground">
                  {ind.limit_value || "-"}
                </td>

                <td className="p-3">
                  {isCfu ? (
                    <div className="flex gap-2 items-center">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">
                          22°C
                        </label>
                        <Input
                          className="w-[80px]"
                          type="number"
                          value={cfuData?.temp22 ?? ""}
                          onChange={(e) =>
                            handleCfuChange(
                              ind.sample_indicator_id,
                              ind.result_value,
                              "temp22",
                              e.target.value
                            )
                          }
                          placeholder="0"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">
                          37°C
                        </label>
                        <Input
                          className="w-[80px]"
                          type="number"
                          value={cfuData?.temp37 ?? ""}
                          onChange={(e) =>
                            handleCfuChange(
                              ind.sample_indicator_id,
                              ind.result_value,
                              "temp37",
                              e.target.value
                            )
                          }
                          placeholder="0"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">
                          Дундаж
                        </label>
                        <Input
                          className="w-[80px] bg-muted"
                          type="number"
                          value={cfuData?.average ?? ""}
                          readOnly
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          ind.is_detected === true ? "default" : "outline"
                        }
                        onClick={() =>
                          onUpdateIndicator(ind.sample_indicator_id, {
                            is_detected: true,
                            is_within_limit: false,
                          })
                        }
                      >
                        Илэрсэн
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant={
                          ind.is_detected === false ? "default" : "outline"
                        }
                        onClick={() =>
                          onUpdateIndicator(ind.sample_indicator_id, {
                            is_detected: false,
                            is_within_limit: true,
                          })
                        }
                      >
                        Илрээгүй
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
