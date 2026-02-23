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
import { FlaskConical, Pencil, Trash2 } from "lucide-react";
import { IndicatorRow } from "./IndicatorRow";

interface ActiveLabTypeCardProps {
  typeName: string;
  standard?: string;
  items: IndicatorRowForLabSpec[];
  onEdit?: () => void;
  onDelete?: () => void;
  onEditIndicator?: (indicator: IndicatorRowForLabSpec) => void;
  onDeleteIndicator?: (indicator: IndicatorRowForLabSpec) => void;
}

export function ActiveLabTypeCard({
  typeName,
  standard,
  items,
  onEdit,
  onDelete,
  onEditIndicator,
  onDeleteIndicator,
}: ActiveLabTypeCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-300/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden animate-fade-in hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-slate-900/50 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
            <FlaskConical className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {typeName}
            </h3>
            {standard && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Стандарт: {standard}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 font-medium"
          >
            {items.length} шинжилгээ
          </Badge>
          {(onEdit || onDelete) && (
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
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <IndicatorRow
                key={item.id}
                indicator={item}
                index={index}
                onEdit={onEditIndicator}
                onDelete={onDeleteIndicator}
              />
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
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
    </div>
  );
}
