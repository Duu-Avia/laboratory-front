import { IndicatorRowForLabSpec } from "@/types";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";

interface IndicatorRowProps {
  indicator: IndicatorRowForLabSpec;
  index: number;
  onEdit?: (indicator: IndicatorRowForLabSpec) => void;
  onDelete?: (indicator: IndicatorRowForLabSpec) => void;
}

export function IndicatorRow({ indicator, index, onEdit, onDelete }: IndicatorRowProps) {
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
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(indicator)}
              className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(indicator)}
              className="h-7 w-7 p-0 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
