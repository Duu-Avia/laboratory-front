import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Calendar,
  Hash,
  FlaskConical,
  TestTube,
  CheckCircle2,
} from "lucide-react";
import { ReportsTableProps } from "@/types";
import { StatusBadge } from "@/app/_components/StatusBadge";

export function ArchiveReportsTable({ data, onRowClick }: ReportsTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner">
          <FileText className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Тайлан олдсонгүй
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Шүүлтүүрийн нөхцөлд тохирох тайлан байхгүй байна
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/80 hover:bg-slate-50 border-b border-slate-200">
            <TableHead className="py-4 pl-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Он сар
              </div>
            </TableHead>
            <TableHead className="py-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Hash className="w-3.5 h-3.5" />№
              </div>
            </TableHead>
            <TableHead className="py-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                Дээжны нэр
              </div>
            </TableHead>
            <TableHead className="py-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <FlaskConical className="w-3.5 h-3.5" />
                Оруулсан дээжүүд
              </div>
            </TableHead>
            <TableHead className="py-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <TestTube className="w-3.5 h-3.5" />
                Сонгогдсон/Ши
              </div>
            </TableHead>
            <TableHead className="py-4 pr-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Төлөв
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((dataItem, index) => (
            <TableRow
              key={dataItem.id}
              onClick={() => onRowClick(dataItem)}
              className="group cursor-pointer border-b border-slate-100 last:border-0 hover:bg-gradient-to-r hover:from-blue-200 hover:to-indigo-50/30  duration-500"
            >
              <TableCell className="py-5 pl-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Calendar className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {dataItem.created_at.slice(0, 10)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-5">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-400 transition-all shadow-sm">
                  {index + 1}
                </span>
              </TableCell>
              <TableCell className="py-5">
                <span className="font-semibold text-slate-800 group-hover:text-blue-400 transition-colors text-base">
                  {dataItem.report_title}
                </span>
              </TableCell>
              <TableCell className="py-5">
                <div className="flex flex-col gap-1.5">
                  {dataItem.sample_names?.split(",").map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                        {i + 1}
                      </span>
                      <span className="group-hover:text-slate-800 transition-colors">
                        {name.trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="py-5">
                <div className="flex flex-wrap gap-1.5">
                  {dataItem.indicator_names?.split(",").map((name, i) => (
                    <span
                      key={i}
                      className="inline-block px-2.5 py-1 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-200 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:text-blue-400 group-hover:border-blue-200 transition-all"
                    >
                      {name.trim()}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="py-5 pr-6">
                <StatusBadge status={dataItem.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
