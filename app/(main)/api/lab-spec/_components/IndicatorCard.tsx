import { IndicatorRowForLabSpec } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlaskConical, CheckCircle2, Circle, RotateCcw, Pencil, Trash2 } from "lucide-react";

interface IndicatorCardProps {
  typeName: string;
  standard?: string;
  items: IndicatorRowForLabSpec[];
  isActive?: boolean;
  compact?: boolean;
  onReactivate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function IndicatorCard({
  typeName,
  standard,
  items,
  isActive = true,
  compact = false,
  onReactivate,
  onEdit,
  onDelete,
}: IndicatorCardProps) {
  // Compact styling for inactive lab types
  const cardClasses = compact
    ? `rounded-xl border border-orange-200/60 dark:border-orange-700/60 bg-white/60 dark:bg-slate-900/60 overflow-hidden opacity-70 hover:opacity-90 transition-all duration-300 scale-95`
    : `rounded-2xl border border-emerald-300/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden animate-fade-in hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-slate-900/50 transition-all duration-300 ${!isActive ? 'opacity-60 grayscale' : ''}`;

  const headerClasses = compact
    ? "flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-orange-50/50 dark:bg-orange-950/20 border-b border-orange-200/60 dark:border-orange-700/60"
    : "flex flex-wrap items-center justify-between gap-4 px-6 py-5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60";

  const iconSize = compact ? "h-8 w-8" : "h-12 w-12";
  const iconWrapperClasses = compact
    ? `flex ${iconSize} items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800`
    : `flex ${iconSize} items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900`;

  const titleSize = compact ? "text-base" : "text-lg";

  return (
    <div className={cardClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <div className="flex items-center gap-3">
          <div className={iconWrapperClasses}>
            <FlaskConical className={`${compact ? "h-4 w-4" : "h-6 w-6"} ${compact ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-slate-900 dark:text-white ${titleSize}`}>
                {typeName}
              </h3>
              {!isActive && (
                <Badge variant="outline" className="border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 text-xs">
                  Идэвхгүй
                </Badge>
              )}
            </div>
            {standard && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Стандарт: {standard}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isActive && onReactivate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReactivate}
              className="gap-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Идэвхжүүлэх
            </Button>
          )}
          <Badge
            variant="secondary"
            className={`font-medium ${compact ? "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800 px-2 py-0.5 text-xs" : "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5"}`}
          >
            {items.length} шинжилгээ
          </Badge>
          {isActive && !compact && (onEdit || onDelete) && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="h-8 w-8 p-0 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <Pencil className="h-4 w-4 text-cyan-400" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-8 w-8 p-0 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {!compact && (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-50/80 dark:hover:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60">
                <TableHead className="w-[70px] text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  №
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Шинжилгээ
                </TableHead>
                <TableHead className="w-[100px] text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Нэгж
                </TableHead>
                <TableHead className="w-[200px] text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Арга стандарт
                </TableHead>
                <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Зөвш / хэмжээ
                </TableHead>
                <TableHead className="w-[100px] text-right text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Default
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="group transition-all duration-150 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border-b border-slate-100 dark:border-slate-900/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="text-sm text-slate-500 dark:text-slate-500 font-mono">
                    {item.id}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    {item.indicator_name}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {item.unit || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {item.test_method || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {item.limit_value || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.is_default ? (
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
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-5 text-center text-slate-600 dark:text-slate-400"
                  >
                    <FlaskConical className="mx-auto h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Шинжилгээ олдсонгүй</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Compact view - just show count, no table */}
      {compact && items.length === 0 && (
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-600">Шинжилгээ байхгүй</p>
        </div>
      )}
    </div>
  );
}
