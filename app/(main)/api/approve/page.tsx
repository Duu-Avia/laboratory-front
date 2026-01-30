"use client";
import { useEffect, useState } from "react";

import { ArchiveReportsTable } from "../archive/components/ArchiveReportsTable";
import { RecentDay } from "@/app/utils/GetRecentDays";
import { ReportRow, SampleType } from "@/types";
import { PdfViewModal } from "@/app/_components/PdfViewModal";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError } from "@/lib/errors";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Search, Filter } from "lucide-react";
import { ApproveReportsTable } from "./_components/ApproveReportsTable";

export default function ApprovePage() {
  const thirtyDaysAgo = RecentDay().thirtyDayAgo;
  const today = RecentDay().today;

  // Filters
  const [from, setFrom] = useState<string>(thirtyDaysAgo);
  const [to, setTo] = useState<string>(today);
  const [search, setSearch] = useState<string>("");
  const [selectedSampleType, setSelectedSampleType] = useState<string>("all");

  // Data
  const [data, setData] = useState<ReportRow[]>([]);
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);

  // Modals
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfReportId, setPdfReportId] = useState<number | null>(null);
  const [pdfReportTitle, setPdfReportTitle] = useState("");
  const [pdfReportStatus, setPdfReportStatus] = useState<
    ReportRow["status"] | undefined
  >();

  // Fetch sample types
  useEffect(() => {
    api
      .get<SampleType[]>(ENDPOINTS.SAMPLE_TYPES.LIST)
      .then((data) => setSampleTypes(data))
      .catch((err) => logError(err, "Fetch sample types"));
  }, []);

  // Fetch only tested reports
  const fetchReports = () => {
    api
      .get<ReportRow[]>(ENDPOINTS.REPORTS.ARCHIVE("signed"))
      .then((response) => {
        if (!Array.isArray(response)) {
          logError(
            "Expected array from /reports/archive",
            "Fetch tested reports"
          );
          setData([]);
          return;
        }
        setData(response);
      })
      .catch((err) => {
        logError(err, "Fetch tested reports");
        setData([]);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter data
  const filtered = data.filter((r) => {
    const matchSearch =
      !search ||
      r.report_title.toLowerCase().includes(search.toLowerCase()) ||
      r.sample_names.toLowerCase().includes(search.toLowerCase());

    const matchSampleType =
      selectedSampleType === "all" || r.sample_type === selectedSampleType;
    const reportDateStr = r.created_at.slice(0, 10);
    const matchDateFrom = !from || reportDateStr >= from;
    const matchDateTo = !to || reportDateStr <= to;

    return matchSearch && matchSampleType && matchDateFrom && matchDateTo;
  });

  function handleRowClick(report: ReportRow) {
    setPdfReportId(report.id);
    setPdfReportTitle(report.report_title);
    setPdfReportStatus(report.status);
    setPdfModalOpen(true);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Баталгаажуулах хүсэлт
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Шинжилгээ дууссан тайлангуудыг батлах
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              Эхлэх он
            </Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-[160px] h-10 border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-lg text-sm transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              Дуусах он
            </Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-[160px] h-10 border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-lg text-sm transition-colors"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-[280px]">
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Search className="w-3 h-3" />
              Түлхүүр үгээр хайх
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Тайлангийн нэрээр хайх..."
                className="pl-10 w-[50%] h-10 border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-lg text-sm transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Sample Type Filters */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <Filter className="w-3 h-3" />
            Лаб төрөлөөр хайх
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedSampleType("all")}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${
                  selectedSampleType === "all"
                    ? "bg-slate-800 text-white shadow-lg shadow-slate-800/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                }
              `}
            >
              Бүгд
            </button>
            {sampleTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedSampleType(type.type_name)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    selectedSampleType === type.type_name
                      ? "bg-slate-800 text-white shadow-lg shadow-slate-800/25"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                  }
                `}
              >
                {type.type_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ApproveReportsTable data={filtered} onRowClick={handleRowClick} />

      <PdfViewModal
        open={pdfModalOpen}
        reportTitle={pdfReportTitle}
        reportId={pdfReportId}
        reportStatus={pdfReportStatus}
        onOpenChange={setPdfModalOpen}
        onApproved={fetchReports}
        sampleTypes={sampleTypes}
      />

      <div className="text-sm font-bold text-muted-foreground text-right pr-6">
        <span>Нийт илэрц: {filtered.length}</span>
      </div>
    </div>
  );
}
