"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Calendar, ChevronDown } from "lucide-react";
import { ReportsTableProps, ReportRow } from "@/types";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { ColumnFilter } from "@/app/_components/ColumnFilter";
import { STATUS_OPTIONS } from "@/lib/constants";
import { ColumnFilters } from "@/types/report";

const INITIAL_FILTERS: ColumnFilters = {
  created_at: "",
  id: "",
  sample_names: "",
  indicator_names: "",
  created_by_name: "",
  status: "",
};

// Filter out "all" from STATUS_OPTIONS for column filter dropdown
const STATUS_FILTER_OPTIONS = STATUS_OPTIONS.filter((opt) => opt.key !== "all");

const MONTH_NAMES = [
  "1-р сар",
  "2-р сар",
  "3-р сар",
  "4-р сар",
  "5-р сар",
  "6-р сар",
  "7-р сар",
  "8-р сар",
  "9-р сар",
  "10-р сар",
  "11-р сар",
  "12-р сар",
];

function groupByMonth(data: ReportRow[]) {
  const groups: Record<string, ReportRow[]> = {};
  for (const item of data) {
    const key = item.created_at.slice(0, 7); // "YYYY-MM"
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  // Sort keys descending (newest first)
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function formatMonthLabel(key: string) {
  const [year, month] = key.split("-");
  const monthIndex = parseInt(month, 10) - 1;
  return `${year} оны ${MONTH_NAMES[monthIndex]}`;
}

export function ArchiveReportsTable({ data, onRowClick }: ReportsTableProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<ColumnFilters>(INITIAL_FILTERS);

  const setFilter = (key: keyof ColumnFilters, value: string) =>
    setFilters((prev: ColumnFilters) => ({ ...prev, [key]: value }));

  // Extract unique suggestions for autocomplete columns
  const suggestions = useMemo(() => {
    const samples = new Set<string>();
    const indicators = new Set<string>();

    for (const row of data) {
      row.sample_names?.split(",").forEach((s) => {
        const trimmed = s.trim();
        if (trimmed) samples.add(trimmed);
      });
      row.indicator_names?.split(",").forEach((s) => {
        const trimmed = s.trim();
        if (trimmed) indicators.add(trimmed);
      });
    }

    return {
      samples: Array.from(samples).sort(),
      indicators: Array.from(indicators).sort(),
    };
  }, [data]);

  // Apply column filters before grouping
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

      if (filters.status && row.status !== filters.status) return false;

      return true;
    });
  }, [data, filters]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/80 hover:bg-slate-50 border-b border-slate-200">
            <TableHead style={{ width: "5%" }} className="py-4 pl-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                №
              </div>
            </TableHead>
            <TableHead style={{ width: "13%" }} className="py-4">
              <ColumnFilter
                label="Он сар"
                value={filters.created_at}
                onChange={(val) => setFilter("created_at", val)}
              />
            </TableHead>
            <TableHead style={{ width: "8%" }} className="py-4">
              <ColumnFilter
                label="Дугаар"
                value={filters.id}
                onChange={(val) => setFilter("id", val)}
              />
            </TableHead>
            <TableHead style={{ width: "28%" }} className="py-4">
              <ColumnFilter
                label="Сорьцын нэр"
                value={filters.sample_names}
                onChange={(val) => setFilter("sample_names", val)}
                suggestions={suggestions.samples}
              />
            </TableHead>
            <TableHead style={{ width: "32%" }} className="py-4">
              <ColumnFilter
                label="Сонгосон шинжилгээ"
                value={filters.indicator_names}
                onChange={(val) => setFilter("indicator_names", val)}
                suggestions={suggestions.indicators}
              />
            </TableHead>
            <TableHead style={{ width: "14%" }} className="py-4 pr-6">
              Төлөв
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grouped.map(([monthKey, items]) => {
            const isExpanded = expandedMonths.has(monthKey);
            return (
              <MonthGroup
                key={monthKey}
                monthKey={monthKey}
                items={items}
                isExpanded={isExpanded}
                onToggle={() => toggleMonth(monthKey)}
                onRowClick={onRowClick}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function MonthGroup({
  monthKey,
  items,
  isExpanded,
  onToggle,
  onRowClick,
}: {
  monthKey: string;
  items: ReportRow[];
  isExpanded: boolean;
  onToggle: () => void;
  onRowClick: (report: ReportRow) => void;
}) {
  return (
    <>
      {/* Month header row */}
      <TableRow
        onClick={onToggle}
        className="cursor-pointer border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white hover:from-blue-50 hover:to-indigo-50/30 transition-colors duration-300"
      >
        <TableCell colSpan={6} className="py-4 pl-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
              <Calendar className="w-4.5 h-4.5 text-blue-500" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              {formatMonthLabel(monthKey)}
            </span>
            <span className="ml-1 text-xs font-medium text-slate-400">
              ({items.length} тайлан)
            </span>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 ml-auto mr-2 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </TableCell>
      </TableRow>

      {/* Expandable report rows */}
      <tr>
        <td colSpan={6} className="p-0">
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-in-out"
            style={{
              gridTemplateRows: isExpanded ? "1fr" : "0fr",
            }}
          >
            <div className="overflow-hidden">
              <table className="w-full table-fixed">
                <tbody>
                  {items.map((dataItem, index) => (
                    <tr
                      key={dataItem.id}
                      onClick={() => onRowClick(dataItem)}
                      className="group cursor-pointer border-b border-slate-100 last:border-0 hover:bg-gradient-to-r hover:from-blue-200 hover:to-indigo-50/30 duration-500"
                    >
                      <td style={{ width: "5%" }} className="py-5 pl-4">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-400 transition-all shadow-sm">
                          {index + 1}
                        </span>
                      </td>
                      <td style={{ width: "13%" }} className="py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Calendar className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {dataItem.created_at.slice(0, 10)}
                          </span>
                        </div>
                      </td>
                      <td style={{ width: "8%" }} className="py-5">
                        <span className="font-semibold text-slate-800 group-hover:text-blue-400 transition-colors text-base">
                          {dataItem.id}
                        </span>
                      </td>
                      <td style={{ width: "28%" }} className="py-5">
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
                      </td>
                      <td style={{ width: "32%" }} className="py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {dataItem.indicator_names
                            ?.split(",")
                            .map((name, i) => (
                              <span
                                key={i}
                                className="inline-block px-2.5 py-1 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-200 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:text-blue-400 group-hover:border-blue-200 transition-all"
                              >
                                {name.trim()}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td style={{ width: "14%" }} className="py-5 pr-6">
                        <StatusBadge status={dataItem.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}
