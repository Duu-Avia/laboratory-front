"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Components
import { ReportsTable } from "./_components/ReportsTable";
import { CreateReportModal } from "./_components/CreateReportModal";
import { FilterBar } from "./_components/FilterBar";
import { PdfViewModal } from "./_components/PdfViewModal";

// Types
import type { ReportRow, SampleType, StatusFilter } from "@/types";

// Lib
import { api, fetchBlob } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { STATUS_LABELS } from "@/lib/constants";
import { useAuth } from "@/lib/hooks";
import { logError } from "@/lib/errors";

// Utils
import { RecentDay } from "./utils/GetRecentDays";

export default function ReportsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const thirtyDaysAgo = RecentDay().thirtyDayAgo;
  const today = RecentDay().today;

  // Filters
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState<string>(thirtyDaysAgo);
  const [to, setTo] = useState<string>(today);
  const [search, setSearch] = useState<string>("");
  const [selectedSampleType, setSelectedSampleType] = useState<string>("all");

  // Data
  const [data, setData] = useState<ReportRow[]>([]);
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfReportId, setPdfReportId] = useState<number | null>(null);
  const [pdfReportTitle, setPdfReportTitle] = useState("");

  // Fetch sample types
  useEffect(() => {
    api
      .get<SampleType[]>(ENDPOINTS.SAMPLE_TYPES.LIST)
      .then((data) => setSampleTypes(data))
      .catch((err) => logError(err, "Fetch sample types"));
  }, []);

  // Fetch reports
  const fetchReports = () => {
    api
      .get<ReportRow[]>(ENDPOINTS.REPORTS.LIST)
      .then((response) => {
        if (!Array.isArray(response)) {
          logError("Expected array from /reports", "Fetch reports");
          setData([]);
          return;
        }
        setData(response);
      })
      .catch((err) => {
        logError(err, "Fetch reports");
        setData([]);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter data
  const filtered = data.filter((r) => {
    const statusMatch = STATUS_LABELS[r.status] || "";

    const matchSearch =
      !search ||
      statusMatch.toLowerCase().includes(search.toLowerCase()) ||
      r.report_title.toLowerCase().includes(search.toLowerCase()) ||
      r.sample_names.toLowerCase().includes(search.toLowerCase());

    const matchStatus = status === "all" || r.status === status;
    const matchSampleType =
      selectedSampleType === "all" || r.sample_type === selectedSampleType;

    const reportDateStr = r.created_at.slice(0, 10);
    const matchDateFrom = !from || reportDateStr >= from;
    const matchDateTo = !to || reportDateStr <= to;

    return (
      matchSearch &&
      matchStatus &&
      matchSampleType &&
      matchDateFrom &&
      matchDateTo
    );
  });

  function handleRowClick(report: ReportRow) {
    if (report.status === "tested" || report.status === "approved") {
      setPdfReportId(report.id);
      setPdfReportTitle(report.report_title);
      setPdfModalOpen(true);
    } else {
      router.push(`/reports/${report.id}`);
    }
  }

  const handleExcelConvert = async () => {
    try {
      const blob = await fetchBlob(ENDPOINTS.REPORTS.EXCEL(status));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      logError(err, "Excel export");
    }
  };

  return (
    <div className="p-6 space-y-5">
      <FilterBar
        from={from}
        to={to}
        search={search}
        selectedSampleType={selectedSampleType}
        status={status}
        sampleTypes={sampleTypes}
        onFromChange={setFrom}
        onToChange={setTo}
        onSearchChange={setSearch}
        onSampleTypeChange={setSelectedSampleType}
        onStatusChange={setStatus}
        onCreateClick={() => setCreateModalOpen(true)}
        onExportClick={handleExcelConvert}
        onLogout={logout}
      />

      <ReportsTable data={filtered} onRowClick={handleRowClick} />

      <CreateReportModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        sampleTypes={sampleTypes}
        from={from}
        to={to}
        onCreated={fetchReports}
      />

      <PdfViewModal
        open={pdfModalOpen}
        reportTitle={pdfReportTitle}
        reportId={pdfReportId}
        onOpenChange={setPdfModalOpen}
        sampleTypes={sampleTypes}
      />

      <div className="text-sm font-bold text-muted-foreground text-right pr-6">
        <span>
          Нийт илэрц:{" "}
          {filtered.filter((item) => item.status !== "deleted").length}
        </span>
      </div>
    </div>
  );
}
