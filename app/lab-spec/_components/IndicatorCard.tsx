import { IndicatorRowForLabSpec } from "@/app/types/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlaskConical, CheckCircle2, Circle } from "lucide-react";

interface IndicatorCardProps {
  typeName: string;
  standard?: string;
  items: IndicatorRowForLabSpec[];
}

export function IndicatorCard({
  typeName,
  standard,
  items,
}: IndicatorCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden animate-fade-in hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-slate-900/50 transition-shadow duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
            <FlaskConical className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              {typeName}
            </h3>
            {standard && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Стандарт: {standard}
              </p>
            )}
          </div>
        </div>
        <Badge
          variant="secondary"
          className="font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5"
        >
          {items.length} шинжилгээ
        </Badge>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-50/80 dark:hover:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60">
              <TableHead className="w-[70px] text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                ID
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
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 dark:bg-blue-950/50 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
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
                  className="py-16 text-center text-slate-600 dark:text-slate-400"
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
