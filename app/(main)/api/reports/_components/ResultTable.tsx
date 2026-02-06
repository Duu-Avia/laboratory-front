import { Input } from "@/components/ui/input";

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
    <div className="overflow-auto rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">
              Шинжилгээний нэр
            </th>
            <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300 w-[140px]">
              Нэгж
            </th>
            <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300 w-[140px]">
              Хязгаар
            </th>
            <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">
              Шинжилгээний хариу
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900">
          {indicators.map((ind) => {
            const isCfu = ind.unit?.toLowerCase().includes("cfu");
            const cfuData = isCfu ? parseCfuValue(ind.result_value) : null;

            return (
              <tr
                key={ind.sample_indicator_id}
                className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors"
              >
                <td className="p-4 font-medium text-slate-900 dark:text-white">
                  {ind.indicator_name}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400">
                  {ind.unit || "-"}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400">
                  {ind.limit_value || "-"}
                </td>

                <td className="p-4">
                  {isCfu ? (
                    <div className="flex gap-3 items-center">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          22°C
                        </label>
                        <Input
                          className="w-[90px] bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          37°C
                        </label>
                        <Input
                          className="w-[90px] bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Дундаж
                        </label>
                        <Input
                          className="w-[90px] bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-400 font-semibold"
                          type="number"
                          value={cfuData?.average ?? ""}
                          readOnly
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateIndicator(ind.sample_indicator_id, {
                            is_detected: false,
                            is_within_limit: true,
                          })
                        }
                        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                          ind.is_detected === false
                            ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        Илрээгүй
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateIndicator(ind.sample_indicator_id, {
                            is_detected: true,
                            is_within_limit: false,
                          })
                        }
                        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                          ind.is_detected === true
                            ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        Илэрсэн
                      </button>
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
