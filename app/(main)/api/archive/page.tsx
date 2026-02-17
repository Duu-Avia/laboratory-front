"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArchiveReportsTable } from "./components/ArchiveReportsTable";
import { ArchiveHeader } from "./components/Header";
import { RecentDay } from "@/app/utils/GetRecentDays";
import { ReportRow, LabType, StatusFilter } from "@/types";
import { PdfViewModal } from "@/app/_components/PdfViewModal";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError } from "@/lib/errors";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

export default function ArchivePage() {
  const router = useRouter();
  const thirtyDaysAgo = RecentDay().thirtyDayAgo;
  const today = RecentDay().today;
  // Filters
  const [status, setStatus] = useState<StatusFilter>("approved");
  const [from, setFrom] = useState<string>(thirtyDaysAgo);
  const [to, setTo] = useState<string>(today);
  const [search, setSearch] = useState<string>("");
  const [selectedLabType, setSelectedLabType] = useState<string>("all");

  // Data
  const [data, setData] = useState<ReportRow[]>([]);
  const [labTypes, setLabTypes] = useState<LabType[]>([]);

  // Modals
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfReportId, setPdfReportId] = useState<number | null>(null);
  const [pdfReportTitle, setPdfReportTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfReportStatus, setPdfReportStatus] = useState<
    ReportRow["status"] | undefined
  >();
  const [pdfReportCreatedBy, setPdfReportCreatedBy] = useState<number | null>(
    null
  );
  const [pdfReportLabType, setPdfReportLabType] = useState<string | null>(null);

  // Fetch lab types
  useEffect(() => {
    api
      .get<LabType[]>(ENDPOINTS.LAB_TYPES.LIST)
      .then((data) => setLabTypes(data))
      .catch((err) => logError(err, "Fetch lab types on archive page"));
  }, []);

  // Fetch reports
  const fetchReports = () => {
    api
      .get<ReportRow[]>(`${ENDPOINTS.REPORTS.LIST}/archive?mode=${status}`)
      .then((data) => setData(data))
      .catch((err) => logError(err, "Fetch archive reports"));
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [status]);

  // Filter data
  const archiveFiltered = data.filter((r) => {
    const statusLabels: Record<string, string> = {
      draft: "draft",
      approved: "батлагдсан",
      deleted: "устгагдсан",
    };
    const statusMatch = statusLabels[r.status] || "";

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
      matchSearch && matchStatus && matchLabType && matchDateFrom && matchDateTo
    );
  });
  function handleRowClick(report: ReportRow) {
    if (report.status === "tested" || report.status === "approved") {
      setPdfReportId(report.id);
      setPdfReportTitle(report.report_title);
      setPdfReportStatus(report.status);
      setPdfReportCreatedBy(report.created_by ?? null);
      setPdfReportLabType(report.lab_type ?? null);
      setPdfModalOpen(true);
    } else {
      router.push(`/reports/${report.id}`);
    }
  }
  const handleExcelConvert = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/reports/excel?status=${status}`,
        { credentials: "include" }
      );
      if (!response.ok) {
        console.log("export failed");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log("error while download excel ", err);
    }
  };
  return (
    <div className="p-6 space-y-5">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center h-[80vh]"
          >
            <motion.div
              animate={{
                scale: [1, 2, 2, 1, 1],
                rotate: [0, 0, 180, 180, 0],
                borderRadius: ["0%", "0%", "50%", "50%", "0%"],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="w-12 h-12 bg-[#D1B23F]"
              style={{ borderRadius: 5 }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            <ArchiveHeader
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
              onExportClick={handleExcelConvert}
            />

            <ArchiveReportsTable
              data={archiveFiltered}
              onRowClick={handleRowClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <PdfViewModal
        open={pdfModalOpen}
        reportTitle={pdfReportTitle}
        reportId={pdfReportId}
        reportStatus={pdfReportStatus}
        createdBy={pdfReportCreatedBy}
        reportLabType={pdfReportLabType}
        onOpenChange={setPdfModalOpen}
        onApproved={fetchReports}
        labTypes={labTypes}
      />

      <div className="text-sm font-bold text-muted-foreground text-right pr-6">
        <span>
          {" "}
          Нийт илэрц:{" "}
          {archiveFiltered.filter((item) => item.status !== "deleted").length}
        </span>
      </div>
    </div>
  );
}
