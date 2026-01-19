"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReportsTable } from "./_components/ReportsTable";
import { ReportRow, SampleType, StatusFilter } from "./types/types";
import { CreateReportModal } from "./_components/CreateReportModal";
import { FilterBar } from "./_components/FilterBar";
import { PdfViewModal } from "./_components/PdfViewModal";
import { RecentDay } from "./utils/GetRecentDays";
export default function ReportsPage() {
const router = useRouter();
const thirtyDaysAgo = RecentDay().thirtyDayAgo
const today = RecentDay().today
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
    fetch(`http://localhost:8000/sample-types`)
      .then((res) => res.json())
      .then((data) => setSampleTypes(data))
      .catch(() => console.error("Error fetching sample types"));
  }, []);

  // Fetch reports
  const fetchReports = () => {
    fetch("http://localhost:8000/reports")
      .then(async (res) => {
        const json = await res.json();
        if (!Array.isArray(json)) {
          console.error("Expected array from /reports but got:", json);
          setData([]);
          return;
        }
        setData(json);
      })
      .catch((err) => {
        console.error("Error fetching reports:", err);
        setData([]);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter data
  const filtered = data.filter((r) => {
    const statusLabels: Record<string, string> = {
      draft: "draft",
      tested: "шинжилгээ хийгдсэн",
      pending_samples: "дээж хүлээгдэж байна",
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
    const matchSampleType = selectedSampleType === "all" || r.sample_type === selectedSampleType;

    const reportDate = new Date(r.created_at).setHours(0, 0, 0, 0);
    const fromDate = from ? new Date(from).setHours(0, 0, 0, 0) : null;
    const toDate = to ? new Date(to).setHours(0, 0, 0, 0) : null;

    const matchDateFrom = !fromDate || reportDate >= fromDate;
    const matchDateTo = !toDate || reportDate <= toDate;

    return matchSearch && matchStatus && matchSampleType && matchDateFrom && matchDateTo;
  });

  function handleRowClick(report: ReportRow) {
    if (report.status === "tested") {
      setPdfReportId(report.id);
      setPdfReportTitle(report.report_title);
      setPdfModalOpen(true);
    } else {
      router.push(`/reports/${report.id}`);
    }
  }

  const handleExcelConvert = async()=> {
    try{
      const response = await fetch(`http://localhost:8000/reports/excel?status=${status}`,)
      if(!response.ok)
      console.log(response)
    }catch(err){
      console.log("error while download excel ")
    }
    console.log("excel export daragdsan shvv")
  }

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

      <div className="text-sm text-muted-foreground text-right pr-6">
       <span> Нийт илэрц: {filtered.filter((item)=>(item.status !== "deleted")).length}</span>
      </div>
    </div>
  );
}