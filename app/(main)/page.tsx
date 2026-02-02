"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Components

// Types
import type { ReportRow, LabType, StatusFilter } from "@/types";

// Lib
import { api, fetchBlob } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { STATUS_LABELS } from "@/lib/constants";
import { logError } from "@/lib/errors";
import { RecentDay } from "../utils/GetRecentDays";
import { FilterBar } from "../_components/FilterBar";
import { ReportsTable } from "../_components/ReportsTable";
import { CreateReportModal } from "../_components/CreateReportModal";
import { PdfViewModal } from "../_components/PdfViewModal";
import * as motion from "motion/react-client"

// Utils

export default function ReportsPage() {
  const router = useRouter();
  const thirtyDaysAgo = RecentDay().thirtyDayAgo;
  const today = RecentDay().today;

  // Filters
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState<string>(thirtyDaysAgo);
  const [to, setTo] = useState<string>(today);
  const [search, setSearch] = useState<string>("");
  const [selectedLabType, setSelectedLabType] = useState<string>("all");

  // Data
  const [data, setData] = useState<ReportRow[]>([]);
  const [labTypes, setLabTypes] = useState<LabType[]>([]);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfReportId, setPdfReportId] = useState<number | null>(null);
  const [pdfReportTitle, setPdfReportTitle] = useState("");
  const [pdfReportStatus, setPdfReportStatus] = useState<ReportRow["status"] | undefined>();
  const [pdfReportAssignedTo, setPdfReportAssignedTo] = useState<number | null>(null);

  // Fetch lab types
  useEffect(() => {
    api
      .get<LabType[]>(ENDPOINTS.LAB_TYPES.LIST)
      .then((data) => setLabTypes(data))
      .catch((err) => logError(err, "Fetch lab types"));
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
    const matchLabType =
      selectedLabType === "all" || r.lab_type === selectedLabType;

    const reportDateStr = r.created_at.slice(0, 10);
    const matchDateFrom = !from || reportDateStr >= from;
    const matchDateTo = !to || reportDateStr <= to;

    return (
      matchSearch &&
      matchStatus &&
      matchLabType &&
      matchDateFrom &&
      matchDateTo
    );
  });

  function handleRowClick(report: ReportRow) {
    if (report.status === "tested" || report.status === "approved" || report.status === "signed") {
      setPdfReportId(report.id);
      setPdfReportTitle(report.report_title);
      setPdfReportStatus(report.status);
      setPdfReportAssignedTo(report.assigned_to ?? null);
      setPdfModalOpen(true);
    } else {
      router.push(`/api/reports/${report.id}`);
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
    <div className="p-4 space-y-5">
      <FilterBar
        from={from}
        to={to}
        search={search}
        selectedLabType={selectedLabType}
        status={status}
        labTypes={labTypes}
        onFromChange={setFrom}
        onToChange={setTo}
        onSearchChange={setSearch}
        onLabTypeChange={setSelectedLabType}
        onStatusChange={setStatus}
        onCreateClick={() => setCreateModalOpen(true)}
        onExportClick={handleExcelConvert}
      />
  
      <ReportsTable data={filtered} onRowClick={handleRowClick} />
      
      <CreateReportModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        labTypes={labTypes}
        from={from}
        to={to}
        onCreated={fetchReports}
      />

      <PdfViewModal
        open={pdfModalOpen}
        reportTitle={pdfReportTitle}
        reportId={pdfReportId}
        reportStatus={pdfReportStatus}
        assignedTo={pdfReportAssignedTo}
        onOpenChange={setPdfModalOpen}
        onApproved={fetchReports}
        labTypes={labTypes}
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
