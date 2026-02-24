"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Components
// Types
import type { ReportRow, LabType, StatusFilter } from "@/types";

// Lib
import { api, fetchBlob } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { STATUS_LABELS } from "@/lib/constants";
import { logError } from "@/lib/errors";
import { countByLabType } from "@/lib/counterLab";
import { useUser } from "@/lib/hooks/useUser";
import { RecentDay } from "../utils/GetRecentDays";
import { Header } from "../_components/Header";
import { ReportsTable } from "../_components/ReportsTable";
import { CreateReportModal } from "../_components/CreateReportModal";
import { PdfViewModal } from "../_components/PdfViewModal";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { ROUTES } from "@/lib/routes";
// Utils

const ADMIN_ROLES = ["superadmin"];

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useUser();
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
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfReportId, setPdfReportId] = useState<number | null>(null);
  const [pdfReportTitle, setPdfReportTitle] = useState("");
  const [pdfReportStatus, setPdfReportStatus] = useState<
    ReportRow["status"] | undefined
  >();
  const [pdfReportCreatedBy, setPdfReportCreatedBy] = useState<number | null>(
    null
  );
  const [pdfReportLabType, setPdfReportLabType] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Fetch lab types — super admin, others get their assigned types from /auth/me
  useEffect(() => {
    if (!user) return;
    const isAdmin = ADMIN_ROLES.includes(user.role ?? "");

    const labTypesPromise = isAdmin
      ? api
          .get<LabType[]>(ENDPOINTS.LAB_TYPES.LIST)
          .then((data) => setLabTypes(data))
          .catch((err) => logError(err, "Fetch lab types"))
      : Promise.resolve(setLabTypes(user.lab_types ?? []));

    const reportsPromise = api
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

    Promise.all([labTypesPromise, reportsPromise]).finally(() =>
      setLoading(false)
    );
  }, [user]);

  // Fetch reports (for refresh after create/approve/etc)
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

  // Filter data
  const filtered = data.filter((r) => {
    const statusMatch = STATUS_LABELS[r.status] || "";

    const matchSearch =
      !search ||
      statusMatch.toLowerCase().includes(search.toLowerCase()) ||
      String(r.id).includes(search) ||
      (r.sample_names ?? "").toLowerCase().includes(search.toLowerCase());

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
    const isOwner =
      user?.id != null &&
      report.created_by != null &&
      user.id === report.created_by;

    if (
      report.status === "tested" ||
      report.status === "approved" ||
      report.status === "signed" ||
      report.status === "rejected"
    ) {
      setPdfReportId(report.id);
      setPdfReportTitle(report.report_title);
      setPdfReportStatus(report.status);
      setPdfReportCreatedBy(report.created_by ?? null);
      setPdfReportLabType(report.lab_type ?? null);
      setPdfModalOpen(true);
    } else if (isOwner) {
      router.push(ROUTES.app.reportDetail(report.id));
    }
  }

  const labTypeCounts = useMemo(() => countByLabType(data), [data]);

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

  const handleDeleteSuccess = () => {
    setDeleteSuccess(true);
    fetchReports();
    setTimeout(() => {
      setDeleteSuccess(false);
    }, 3000);
  };
  return (
    <div className="p-4 space-y-5">
      {/* Delete Success Banner */}
      {deleteSuccess && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-6 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-white text-2xl font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-400">
                Амжилттай устгагдлаа!
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-0.5">
                Тайлан амжилттай устгагдлаа.
              </p>
            </div>
          </div>
        </div>
      )}

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
            <Header
              from={from}
              to={to}
              search={search}
              selectedLabType={selectedLabType}
              status={status}
              labTypes={labTypes}
              labTypeCounts={labTypeCounts}
              onFromChange={setFrom}
              onToChange={setTo}
              onSearchChange={setSearch}
              onLabTypeChange={setSelectedLabType}
              onStatusChange={setStatus}
              onCreateClick={() => setCreateModalOpen(true)}
              onExportClick={handleExcelConvert}
            />

            <ReportsTable data={filtered} onRowClick={handleRowClick} />

            <div className="text-sm font-bold text-muted-foreground text-right pr-6">
              <span>
                Нийт илэрц:{" "}
                {filtered.filter((item) => item.status !== "deleted").length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        createdBy={pdfReportCreatedBy}
        reportLabType={pdfReportLabType}
        onOpenChange={setPdfModalOpen}
        onApproved={fetchReports}
        onDeleted={handleDeleteSuccess}
        labTypes={labTypes}
      />
    </div>
  );
}
