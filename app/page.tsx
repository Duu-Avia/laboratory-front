"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReportsTable } from "./_components/ReportsTable";
import { Indicator, ReportRow, SampleType, StatusFilter } from "./types/types";
import { CreateReportModal } from "./_components/CreateReportModal";
import { FilterBar } from "./_components/FilterBar";
import { PdfViewModal } from "./_components/PdfViewModal";

export default function ReportsPage() {
  const router = useRouter();

  // Filters
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState<string>("2026-01-10");
  const [to, setTo] = useState<string>("2026-01-17");
  const [search, setSearch] = useState<string>("");
  const [selectedSampleType, setSelectedSampleType] = useState<string>("all");

  // Data
  const [data, setData] = useState<ReportRow[]>([]);
  const [sampleType, setSampleType] = useState<SampleType[]>([]);

  // Modals
  const [open, setOpen] = useState(false);
  const [openPdf, setOpenPdf] = useState(false);
  const [pdfReportId, setPdfReportId] = useState<number | null>(null);
  const [pdfReportTitle, setPdfReportTitle] = useState("")

  // Form state
  const [reportTitle, setReportTitle] = useState("");
  const [sampleGroup, setSampleGroup] = useState<{
    sample_type_id: number | null;
    sample_names: string[];
    location: string;
    sample_date: string;
    sampled_by: string;
    indicators: number[];
    availableIndicators: Indicator[];
  }>({
    sample_type_id: null,
    sample_names: [""],
    location: "",
    sample_date: from,
    sampled_by: "",
    indicators: [],
    availableIndicators: [],
  });

  useEffect(() => {
    fetch(`http://localhost:8000/sample-types`)
      .then((res) => res.json())
      .then((data) => setSampleType(data))
      .catch((err) => console.log(`error while fetching sample type`));
  }, []);

  useEffect(() => {
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
        console.log("error while fetch data", err);
        setData([]);
      });
  }, []);

  // Filter data
  const filtered = data.filter((r) => {
    const statusMatch = {
      draft:"draft",
      tested:"шинжилгээ хийгдсэн",
      pending_samples:"дээж хүлээгдэж байна",
      approved:"батлагдсан",
      deleted:"устгагдсан"
    }[r.status] || ""
    const matchSearch =
      !search || statusMatch.toLowerCase().includes(search) || r.report_title.toLowerCase().includes(search.toLowerCase()) || r.sample_names.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" ? true : r.status === status;
    const matchSampleType = selectedSampleType === "all" ? true : r.sample_type === selectedSampleType;
    const reportDate = new Date(r.created_at).setHours(0,0,0,0);
    const fromDate = from ? new Date(from).setHours(0,0,0,0) : null;
    const toDate = to ? new Date(to).setHours(0,0,0,0) : null;

    const matchDateFrom = !fromDate || reportDate >= fromDate;
    const matchDateTo = !toDate || reportDate <= toDate;
    return matchSearch && matchStatus && matchSampleType && matchDateFrom && matchDateTo;
  });

  // Handlers
  function addSampleName() {
    setSampleGroup((prev) => ({
      ...prev,
      sample_names: [...prev.sample_names, ""],
    }));
  }

  function removeSampleName(index: number) {
    setSampleGroup((prev) => ({
      ...prev,
      sample_names: prev.sample_names.filter((_, i) => i !== index),
    }));
  }

  function updateSampleName(index: number, value: string) {
    setSampleGroup((prev) => ({
      ...prev,
      sample_names: prev.sample_names.map((name, i) => (i === index ? value : name)),
    }));
  }

  async function setTypeAndDefaults(typeId: number) {
    setSampleGroup((prev) => ({ ...prev, sample_type_id: typeId, indicators: [], availableIndicators: [] }));

    try {
      const res = await fetch(`http://localhost:8000/sample/indicators/${typeId}`);
      if (!res.ok) throw new Error("Failed to load indicators");

      const indicators: Indicator[] = await res.json();

      setSampleGroup((prev) => ({
        ...prev,
        sample_type_id: typeId,
        availableIndicators: indicators,
        indicators: [],
      }));
    } catch (err) {
      console.error(err);
      setSampleGroup((prev) => ({ ...prev, sample_type_id: typeId, availableIndicators: [], indicators: [] }));
    }
  }

  function toggleIndicator(indicatorId: number) {
    setSampleGroup((prev) => {
      const exists = prev.indicators.includes(indicatorId);
      return {
        ...prev,
        indicators: exists ? prev.indicators.filter((x) => x !== indicatorId) : [...prev.indicators, indicatorId],
      };
    });
  }

  function handleFieldChange(field: string, value: string) {
    setSampleGroup((prev) => ({ ...prev, [field]: value }));
  }

  function handleRowClick(report: ReportRow) {
    if (report.status === "tested") {
      setPdfReportId(report.id);
      setPdfReportTitle(report.report_title);
      setOpenPdf(true);
    } else {
      router.push(`/reports/${report.id}`);
    }
  }

  const onCreateClick = async () => {
    const samples = sampleGroup.sample_names
      .filter((name) => name.trim() !== "")
      .map((name) => ({
        sample_type_id: sampleGroup.sample_type_id,
        sample_name: name.trim(),
        location: sampleGroup.location,
        sample_date: sampleGroup.sample_date,
        sampled_by: sampleGroup.sampled_by,
        indicators: sampleGroup.indicators,
      }));

    const payload = {
      report_title: reportTitle,
      test_start_date: from,
      test_end_date: to,
      analyst: "",
      approved_by: "",
      samples: samples,
    };

    try {
      const response = await fetch(`http://localhost:8000/reports/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setReportTitle("");
        setSampleGroup({
          sample_type_id: null,
          sample_names: [""],
          location: "",
          sample_date: from,
          sampled_by: "",
          indicators: [],
          availableIndicators: [],
        });
        setOpen(false);
        const json = await fetch("http://localhost:8000/reports").then((r) => r.json());
        setData(json);
      }
    } catch (error) {
      console.log("error while creating sample");
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
        sampleTypes={sampleType}
        onFromChange={setFrom}
        onToChange={setTo}
        onSearchChange={setSearch}
        onSampleTypeChange={setSelectedSampleType}
        onStatusChange={setStatus}
        onCreateClick={() => setOpen(true)}
        onExportClick={() => console.log("export excel")}
      />

      <ReportsTable data={filtered} onRowClick={handleRowClick} />

      <CreateReportModal
        open={open}
        reportTitle={reportTitle}
        sampleGroup={sampleGroup}
        sampleTypes={sampleType}
        onOpenChange={setOpen}
        onReportTitleChange={setReportTitle}
        onAddSampleName={addSampleName}
        onRemoveSampleName={removeSampleName}
        onUpdateSampleName={updateSampleName}
        onTypeChange={setTypeAndDefaults}
        onFieldChange={handleFieldChange}
        onToggleIndicator={toggleIndicator}
        onSave={onCreateClick}
      />

      <PdfViewModal open={openPdf} reportTitle={pdfReportTitle} reportId={pdfReportId} onOpenChange={setOpenPdf} 
      // onAddSampleName={addSampleName}
      // onRemoveSampleName={removeSampleName}
      // onUpdateSampleName={updateSampleName}
      // onTypeChange={setTypeAndDefaults}
      // onFieldChange={handleFieldChange}
      // onToggleIndicator={toggleIndicator}
      />

      <div className="text-sm text-muted-foreground text-right pr-6">
        Нийт илэрц : <span className="text-foreground font-medium">{filtered?.length}</span>
      </div>
    </div>
  );
}