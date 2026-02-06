import { IndicatorRowForLabSpec } from "@/types";
import { TableRow, TableCell } from "@/components/ui/table";
import { CheckCircle2, Circle } from "lucide-react";

interface IndicatorRowProps {
  indicator: IndicatorRowForLabSpec;
  index: number;
}

export function IndicatorRow({ indicator, index }: IndicatorRowProps) {
  return (
    <TableRow
      className="group transition-all duration-150 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border-b border-slate-100 dark:border-slate-900/50"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <TableCell className="text-sm text-slate-500 dark:text-slate-500 font-mono">
        {indicator.id}
      </TableCell>
      <TableCell className="font-semibold text-slate-900 dark:text-white">
        {indicator.indicator_name}
      </TableCell>
      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
        {indicator.unit || "—"}
      </TableCell>
      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
        {indicator.test_method || "—"}
      </TableCell>
      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
        {indicator.limit_value || "—"}
      </TableCell>
      <TableCell className="text-right">
        {indicator.is_default ? (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-medium text-blue-400 dark:text-emerald-300 border border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Default
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-slate-300 dark:text-slate-700">
            <Circle className="h-3.5 w-3.5" />
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
