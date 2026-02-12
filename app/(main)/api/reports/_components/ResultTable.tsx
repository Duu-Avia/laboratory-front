import { Input } from "@/components/ui/input";


function parseCfuValue(resultValue: string | null | undefined) {
  if (!resultValue) return { temp22: "", temp37: "", average: "" };
  try {
    return JSON.parse(resultValue);
  } catch {
    return { temp22: "", temp37: "", average: "" };
  }
}

export type SampleResult = {
  sample_id: number;
  sample_name: string;
  sample_indicator_id: number;
  result_value?: string | null;
  is_detected?: boolean | null;
  is_within_limit?: boolean | null;
  avg?: string | null;
};

export type IndicatorGroup = {
  indicator_id: number;
  indicator_name: string;
  unit?: string | null;
  limit_value?: string | null;
  input_type: string;
  test_method?: string | null;
  sampleResults: SampleResult[];
};

type ResultsTableProps = {
  indicatorGroups: IndicatorGroup[];
  onUpdateIndicator: (
    sampleIndicatorId: number,
    patch: Record<string, any>
  ) => void;
  highlightMissing?: boolean;
};

export function ResultsTable({
  indicatorGroups,
  onUpdateIndicator,
  highlightMissing = false,
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
    <div className="overflow-auto rounded-sm border border-gray-300/60 dark:border-slate-800/60 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-gray-300 dark:border-slate-800">
          <tr>
            <th className="p-4 text-left bg-sky-700 font-semibold text-slate-700 dark:text-slate-300 text-white">
              Шинжилгээний нэр
            </th>
            <th className="p-4 text-center bg-sky-700 font-semibold text-slate-700 dark:text-slate-300 w-[180px] text-white">
              Аргын стандарт
            </th>
            <th className="p-4 text-center bg-sky-700 font-semibold text-slate-700 dark:text-slate-300 w-[180px] text-white">
              Зөвшөөрөгдөх хэмжээ
            </th>
            <th className="p-4 text-left  bg-sky-700 font-semibold text-white dark:text-slate-300">
              Шинжилгээний хариу
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900">
          {indicatorGroups.map((group) => {
            const isCfu = group.unit?.toLowerCase().includes("cfu") ?? false;
            const rowCount = group.sampleResults.length;

            return (
              <IndicatorGroupRows
                key={group.indicator_id}
                group={group}
                isCfu={isCfu}
                rowCount={rowCount}
                onCfuChange={handleCfuChange}
                onUpdateIndicator={onUpdateIndicator}
                highlightMissing={highlightMissing}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IndicatorGroupRows({
  group,
  isCfu,
  rowCount,
  onCfuChange,
  onUpdateIndicator,
  highlightMissing,
}: {
  group: IndicatorGroup;
  isCfu: boolean;
  rowCount: number;
  onCfuChange: (
    sampleIndicatorId: number,
    currentValue: string | null | undefined,
    field: "temp22" | "temp37" | "average",
    newValue: string
  ) => void;
  onUpdateIndicator: (
    sampleIndicatorId: number,
    patch: Record<string, any>
  ) => void;
  highlightMissing: boolean;
}) {
  return (
    <>
      {/* Indicator group header row */}
      <tr className="border-t-2 border-t-gray-400 dark:border-t-slate-700 bg-gray-300 dark:bg-slate-950/30">
        <td
          colSpan={4}
          className="px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-900 dark:bg-white shrink-0" />
            <span className="font-bold text-slate-900 dark:text-white">
              {group.indicator_name}
            </span>
          </div>
        </td>
      </tr>
      {/* Per-sample rows - sample name and result on the same line */}
      {group.sampleResults.map((sr, idx) => (
        <tr
          key={sr.sample_indicator_id}
          className="border-t border-gray-300 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors"
        >
          <td className="pl-6 pr-4 py-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="text-xs font-semibold text-slate-400 w-4">
                {idx + 1}.
              </span>
              <span className="text-sm font-medium">
                {sr.sample_id} {sr.sample_name}
              </span>
            </div>
          </td>
          {idx === 0 && (
            <>
              <td
                rowSpan={rowCount}
                className="p-3 align-middle text-center text-sm text-slate-600 dark:text-slate-400 border-x border-gray-300 dark:border-slate-800"
              >
                {group.test_method || "-"}
              </td>
              <td
                rowSpan={rowCount}
                className="p-3 align-middle text-center text-sm text-slate-600 dark:text-slate-400 border-r border-gray-300 dark:border-slate-800"
              >
                {group.limit_value || "-"}
              </td>
            </>
          )}
          <td className="px-4 py-3">
            {isCfu ? (
              <CfuInput sr={sr} onCfuChange={onCfuChange} highlightMissing={highlightMissing} />
            ) : (
              <DetectionToggle
                sr={sr}
                onUpdateIndicator={onUpdateIndicator}
                highlightMissing={highlightMissing}
              />
            )}
          </td>
        </tr>
      ))}
    </>
  );
}

function CfuInput({
  sr,
  onCfuChange,
  highlightMissing,
}: {
  sr: SampleResult;
  onCfuChange: (
    sampleIndicatorId: number,
    currentValue: string | null | undefined,
    field: "temp22" | "temp37" | "average",
    newValue: string
  ) => void;
  highlightMissing: boolean;
}) {
  const cfuData = parseCfuValue(sr.result_value);
  const emptyT22 = highlightMissing && cfuData.temp22 === "";
  const emptyT37 = highlightMissing && cfuData.temp37 === "";
  const missingStyle = "border-red-400 bg-red-50 dark:bg-red-950/20 dark:border-red-700";
  const normalStyle = "bg-slate-50 dark:bg-slate-950/50 border-gray-300 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="flex gap-3 items-center">
      <div className="flex  gap-2 items-center">
        <label className={`text-xs font-semibold ${emptyT22 ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
          22°C
        </label>
        <Input
          className={`w-[80px] ${emptyT22 ? missingStyle : normalStyle}`}
          type="number"
          value={cfuData.temp22}
          onChange={(e) =>
            onCfuChange(
              sr.sample_indicator_id,
              sr.result_value,
              "temp22",
              e.target.value
            )
          }
          placeholder="0"
        />
      </div>
      <div className="flex gap-2 items-center ">
        <label className={`text-xs font-semibold ${emptyT37 ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
          37°C
        </label>
        <Input
          className={`w-[80px] ${emptyT37 ? missingStyle : normalStyle}`}
          type="number"
          value={cfuData.temp37}
          onChange={(e) =>
            onCfuChange(
              sr.sample_indicator_id,
              sr.result_value,
              "temp37",
              e.target.value
            )
          }
          placeholder="0"
        />
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Дундаж
        </label>
        <Input
          className="w-[80px] bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-400 font-semibold"
          type="number"
          value={cfuData.average}
          readOnly
          placeholder="0"
        />
      </div>
    </div>
  );
}

function DetectionToggle({
  sr,
  onUpdateIndicator,
  highlightMissing,
}: {
  sr: SampleResult;
  onUpdateIndicator: (
    sampleIndicatorId: number,
    patch: Record<string, any>
  ) => void;
  highlightMissing: boolean;
}) {
  const isEmpty = highlightMissing && sr.is_detected === null;
  return (
    <div className={`inline-flex gap-10 rounded-full border p-1 ${isEmpty ? "border-red-400 bg-red-50 dark:bg-red-950/20 dark:border-red-700" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"}`}>
      <button
        type="button"
        onClick={() =>
          onUpdateIndicator(sr.sample_indicator_id, {
            is_detected: false,
            is_within_limit: true,
          })
        }
        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
          sr.is_detected === false
            ? "bg-green-700/70 dark:bg-green-500 text-white dark:text-emerald-400"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
      >
        Илрээгүй
      </button>
      <button
        type="button"
        onClick={() =>
          onUpdateIndicator(sr.sample_indicator_id, {
            is_detected: true,
            is_within_limit: false,
          })
        }
        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
          sr.is_detected === true
            ? "bg-red-700/70 dark:bg-red-950/50 text-white dark:text-red-400"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
      >
        Илэрсэн
      </button>
    </div>
  );
}
