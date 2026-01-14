"use client";
import { IndicatorRow } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ResultsTableProps {
  indicators: IndicatorRow[];
  onUpdateIndicator: (indicatorId: number, patch: Partial<IndicatorRow>) => void;
}

export function ResultsTable({ indicators, onUpdateIndicator }: ResultsTableProps) {
  return (
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
                  onChange={(e) => onUpdateIndicator(ind.indicator_id, { result_value: e.target.value })}
                  placeholder="Enter result"
                />
              </td>

              <td className="p-3">
                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    size="sm"
                    variant={ind.is_detected === true ? "default" : "outline"}
                    onClick={() => onUpdateIndicator(ind.indicator_id, { is_detected: true })}
                  >
                    Илэрсэн
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant={ind.is_within_limit === false ? "default" : "outline"}
                    onClick={() => onUpdateIndicator(ind.indicator_id, { is_within_limit: false })}
                  >
                    Илэрээгүй
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}