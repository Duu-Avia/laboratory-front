"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArchiveReportsTable } from "./components/ArchiveReportsTable";
import { ArchiveHeader } from "./components/Header";
import { RecentDay } from "@/app/utils/GetRecentDays";
import { ReportRow, SampleType, StatusFilter } from "@/app/types/types";
import { PdfViewModal } from "@/app/_components/PdfViewModal";

export default function ArchivePage() {
  const router = useRouter();
  const thirtyDaysAgo = RecentDay().thirtyDayAgo;
  const today = RecentDay().today;
  // Filters
  const [status, setStatus] = useState<StatusFilter>("approved");
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

  // Fetch sample types
  useEffect(() => {
    fetch(`http://localhost:8000/sample-types`)
      .then((res) => res.json())
      .then((data) => setSampleTypes(data))
      .catch(() => console.error("Error fetching sample types"));
  }, []);

  // Fetch reports
  const fetchReports = () => {
    fetch(`http://localhost:8000/reports/archive?mode=${status}`)
      .then(async (res) => {
        const response = await res.json();
        if (!Array.isArray(response)) {
          console.error("Expected array from /reports but got:", response);
          setData([]);
          return;
        }
        setData(response);
      })
      .catch((err) => {
        console.error("Error fetching reports:", err);
        setData([]);
      });
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
  console.log(selectedSampleType);
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
      const response = await fetch(
        `http://localhost:8000/reports/excel?status=${status}`
      );
      if (!response.ok) {
        console.log("export failed");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      console.log(blob);

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
    console.log("excel export daragdsan shvv");
  };
  console.log(data);
  return (
    <div className="p-6 space-y-5">
      <ArchiveHeader
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
        onExportClick={handleExcelConvert}
      />

      <ArchiveReportsTable data={archiveFiltered} onRowClick={handleRowClick} />

      <PdfViewModal
        open={pdfModalOpen}
        reportTitle={pdfReportTitle}
        reportId={pdfReportId}
        onOpenChange={setPdfModalOpen}
        sampleTypes={sampleTypes}
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
