"use client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportRow, ReportsTableProps, ReportStatus } from "../types/types";

function statusBadge(status: ReportStatus) {
  const map: Record<
    ReportStatus,
    {
      text: string;
      variant: "default" | "secondary" | "outline";
      className?: string;
    }
  > = {
    draft: { text: "Draft", variant: "secondary" },
    pending_samples: {
      text: "Дээж хүлээгдэж байна",
      variant: "outline",
      className: "bg-color-yellow-200",
    },
    tested: {
      text: "Шинжилгээ хийгдсэн",
      variant: "outline",
      className: "text-cyan-500",
    },
    approved: {
      text: "Батлагдсан",
      variant: "default",
      className: "bg-green-200",
    },
    deleted: {
      text: "Устгагдсан",
      variant: "outline",
      className: "text-red-500",
    },
  };
  const s = map[status];
  return (
    <Badge className={s.className} variant={s.variant}>
      {s.text}
    </Badge>
  );
}

export function ReportsTable({ data, onRowClick }: ReportsTableProps) {
  return (
    <div className="rounded-xl border bg-background text-left mt-[-15px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Он сар</TableHead>
            <TableHead>№</TableHead>
            <TableHead>Дээжны нэр</TableHead>
            <TableHead>Оруулсан дээжүүд</TableHead>
            <TableHead>Сонгогдсон/Ши</TableHead>
            <TableHead className="text-right pr-15">Төлөв</TableHead>
            <TableHead className="text-right pr-10">Төлөв</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((dataItem, index) => (
            <TableRow
              key={dataItem.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => onRowClick(dataItem)}
            >
              <TableCell>{dataItem.created_at.slice(0, 10)}</TableCell>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <button className="dark:text-sky-400 font-semibold hover:underline text-left">
                  {dataItem.report_title}
                </button>
              </TableCell>
              <TableCell className="max-w-[420px]">
                <div className="flex flex-wrap gap-1 gap-y-2">
                  {dataItem.sample_names?.split(",").map((name, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[12px] text-gray-850 bg-gray-200 font-normal border-gray-600"
                    >
                      <span className="mr-1">{i + 1}.</span>
                      {name.trim()}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="max-w-[420px]">
                <div className="flex flex-wrap gap-1">
                  {dataItem.indicator_names?.split(",").map((name, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-[12px] text-gray-850  font-normal "
                    >
                      {name.trim()}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {statusBadge(dataItem.status)}
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-muted-foreground"
              >
                No reports
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
