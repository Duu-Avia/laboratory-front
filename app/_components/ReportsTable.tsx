"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReportsTableProps } from "@/types";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { ColumnFilter } from "@/app/_components/ColumnFilter";
import { ColumnFilters } from "@/types/report";

const STATUS_OPTIONS = [
  { key: "draft", label: "Draft" },
  { key: "pending_samples", label: "Сорьц хүлээгдэж байна" },
  { key: "signed", label: "Шалгагдаж байна" },
  { key: "tested", label: "Шинжилгээ хийгдсэн" },
  { key: "approved", label: "Батлагдсан" },
  { key: "rejected", label: "Буцаагдсан" },
];

const INITIAL_FILTERS: ColumnFilters = {
  created_at: "",
  id: "",
  sample_names: "",
  indicator_names: "",
  created_by_name: "",
  approved_by:"",
  signed_by:"",
  status: "",
};

export function ReportsTable({ data, onRowClick }: ReportsTableProps) {
  const [filters, setFilters] = useState<ColumnFilters>(INITIAL_FILTERS);

  const setFilter = (key: keyof ColumnFilters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Extract unique suggestions for autocomplete columns
  const suggestions = useMemo(() => {
    const samples = new Set<string>();
    const indicators = new Set<string>();
    const creators = new Set<string>();

    for (const row of data) {
      row.sample_names?.split(",").forEach((s) => {
        const trimmed = s.trim();
        if (trimmed) samples.add(trimmed);
      });
      row.indicator_names?.split(",").forEach((s) => {
        const trimmed = s.trim();
        if (trimmed) indicators.add(trimmed);
      });
      if (row.created_by_name) creators.add(row.created_by_name);
    }

    return {
      samples: Array.from(samples).sort(),
      indicators: Array.from(indicators).sort(),
      creators: Array.from(creators).sort(),
    };
  }, [data]);

  // Apply column filters (partial match with .includes)
  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (
        filters.created_at &&
        !row.created_at.slice(0, 10).includes(filters.created_at)
      )
        return false;

      if (filters.id && !String(row.id).includes(filters.id)) return false;

      if (
        filters.sample_names &&
        !row.sample_names
          ?.toLowerCase()
          .includes(filters.sample_names.toLowerCase())
      )
        return false;

      if (
        filters.indicator_names &&
        !row.indicator_names
          ?.toLowerCase()
          .includes(filters.indicator_names.toLowerCase())
      )
        return false;

      if (
        filters.created_by_name &&
        !row.created_by_name
          ?.toLowerCase()
          .includes(filters.created_by_name.toLowerCase())
      )
        return false;

      if (filters.status && row.status !== filters.status) return false;

      return true;
    });
  }, [data, filters]);
  return (
    <div className="rounded-xl border bg-background text-left mt-[-15px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">№</TableHead>
            <TableHead className="w-[120px]">
              <ColumnFilter
                label="Он сар"
                value={filters.created_at}
                onChange={(v) => setFilter("created_at", v)}
              />
            </TableHead>
            <TableHead className="w-[90px]">
              <ColumnFilter
                label="Дугаар"
                value={filters.id}
                onChange={(v) => setFilter("id", v)}
              />
            </TableHead>
            <TableHead>
              <ColumnFilter
                label="Оруулсан Сорьцүүд"
                value={filters.sample_names}
                onChange={(v) => setFilter("sample_names", v)}
                suggestions={suggestions.samples}
              />
            </TableHead>
            <TableHead>
              <ColumnFilter
                label="Сонгогдсон/Ши"
                value={filters.indicator_names}
                onChange={(v) => setFilter("indicator_names", v)}
                suggestions={suggestions.indicators}
              />
            </TableHead>
            <TableHead className="w-[140px]">
              <ColumnFilter
                label="Үүсгэсэн"
                value={filters.created_by_name}
                onChange={(v) => setFilter("created_by_name", v)}
                suggestions={suggestions.creators}
              />
            </TableHead>
            <TableHead className="w-[160px]">
              <ColumnFilter
                type="select"
                label="Төлөв"
                value={filters.status}
                onChange={(v) => setFilter("status", v)}
                options={STATUS_OPTIONS}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((dataItem, index) => (
            <TableRow
              key={dataItem.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => onRowClick(dataItem)}
            >
              <TableCell className="text-gray-500 text-[11px]">
                {index + 1}
              </TableCell>
              <TableCell>{dataItem.created_at.slice(0, 10)}</TableCell>
              <TableCell>
                <button className="dark:text-sky-400 font-semibold hover:underline text-left">
                  {dataItem.id}
                </button>
              </TableCell>
              <TableCell className="max-w-[420px]">
                <div className="flex flex-wrap gap-1 gap-y-2">
                  {dataItem.sample_names?.split(",").map((name, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[12px] text-gray-850 bg-gray-200 font-normal border-gray-300"
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
              <TableCell><div className="text-[12px] font-semibold">{dataItem.created_by_name || "-"}</div></TableCell>
              <TableCell className="text-right">
                <StatusBadge status={dataItem.status} />
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-10 text-center text-muted-foreground"
              >
                {Object.values(filters).some((v) => v)
                  ? "Шүүлтүүрт тохирох илэрц олдсонгүй"
                  : "No reports"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
