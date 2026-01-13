"use client";
import { useEffect, useState }  from "react";
import {useRouter} from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Indicator, ReportRow, ReportStatus, SampleType, StatusFilter } from "./_components/types/types";

;

const statusOptions: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Бүгдийн" },
  { key: "draft", label: "Draft" },
  { key: "pending_samples", label: "Дээж хүлээгдэж байна" },
  { key: "tested", label: "Шинжилгээ хийгдсэн" },
  { key: "approved", label: "Батлагдсан" },
];

function statusBadge(status: ReportStatus) {
  const map: Record<ReportStatus, { text: string; variant: "default" | "secondary" | "outline"; className?:string }> = {
    draft: { text: "Draft", variant: "secondary", },
    pending_samples: { text: "Дээж хүлээгдэж байна", variant: "outline", className: "bg-color-yellow-200" },
    tested: { text: "Шинжилгээ хийгдсэн", variant: "outline",className: "bg-cyan-500 text-white" },
    approved: {text:"Батлагдсан", variant:"default",className: "bg-color-green-200"},
  };
  const s = map[status];
  return <Badge className={s.className} variant={s.variant}>{s.text}</Badge>;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ReportsPage() {
  // Filters
  const [jobType, setJobType] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState<string>("2026-01-10");
  const [to, setTo] = useState<string>("2026-01-17");
  const [search, setSearch] = useState<string>("");
  const [selectedSampleType, setSelectedSampleType] = useState<string>("all");
  
  // List data
  const [data, setData] = useState<ReportRow[]>([]);
  
  // Modal
  const [open, setOpen] = useState(false);
  const [openPdf, setOpenPdf] = useState(false);
  const [pdfReportId, setPdfReportId] = useState<number | null>(null);
  
  // Create form state
  const [reportTitle, setReportTitle] = useState("");
  const [sampleType, setSampleType] = useState<SampleType[]>([])
  
  // NEW: Single sample group with multiple names
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
    availableIndicators: []
  });
  
  const router = useRouter();

  // Fetch sample types
  useEffect(()=>{
    fetch(`http://localhost:8000/sample-types`)
    .then((res)=> res.json())
    .then((data)=> setSampleType(data))
    .catch((err)=> console.log(`error while fetching sample type`))
  },[])

  // Fetch reports
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
    const matchSearch =
      !search ||
      r.code?.toLowerCase().includes(search.toLowerCase()) ||
      r.report_title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" ? true : r.status === status;
    const matchJob = jobType === "all" ? true : r.workType === jobType;
    const matchSampleType = selectedSampleType === "all" ? true : r.sample_type === selectedSampleType;
    
    return matchSearch && matchStatus && matchJob && matchSampleType;
  });

  function addSampleName() {
    setSampleGroup(prev => ({
      ...prev,
      sample_names: [...prev.sample_names, ""]
    }));
  }

  function removeSampleName(index: number) {
    setSampleGroup(prev => ({
      ...prev,
      sample_names: prev.sample_names.filter((_, i) => i !== index)
    }));
  }

  function updateSampleName(index: number, value: string) {
    setSampleGroup(prev => ({
      ...prev,
      sample_names: prev.sample_names.map((name, i) => i === index ? value : name)
    }));
  }

  async function setTypeAndDefaults(typeId: number) {
    setSampleGroup(prev => ({ ...prev, sample_type_id: typeId, indicators: [], availableIndicators: [] }));

    try {
      const res = await fetch(`http://localhost:8000/sample/indicators/${typeId}`);
      if (!res.ok) throw new Error("Failed to load indicators");

      const indicators: Indicator[] = await res.json();

      setSampleGroup(prev => ({
        ...prev,
        sample_type_id: typeId,
        availableIndicators: indicators,
        indicators:[],
      }));
    } catch (err) {
      console.error(err);
      setSampleGroup(prev => ({ ...prev, sample_type_id: typeId, availableIndicators: [], indicators: [] }));
    }
  }

  function toggleIndicator(indicatorId: number) {
    setSampleGroup(prev => {
      const exists = prev.indicators.includes(indicatorId);
      return {
        ...prev,
        indicators: exists 
          ? prev.indicators.filter(x => x !== indicatorId)
          : [...prev.indicators, indicatorId]
      };
    });
  }

  const onCreateClick = async() => {
    // Create a sample for each sample name
    const samples = sampleGroup.sample_names
      .filter(name => name.trim() !== "")
      .map(name => ({
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

    try{
      const response = await fetch(`http://localhost:8000/reports/create`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        // Reset form
        setReportTitle("");
        setSampleGroup({
          sample_type_id: null,
          sample_names: [""],
          location: "",
          sample_date: from,
          sampled_by: "",
          indicators: [],
          availableIndicators: []
        });
        setOpen(false);
        // Refresh data
        const json = await fetch("http://localhost:8000/reports").then(r => r.json());
        setData(json);
      }
    }catch(error){
      console.log("error while creating sample")
    }
  }
  
  return (
    <div className="p-6 space-y-5">
      {/* Top filters row */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-[170px]">
            <Label className="text-xs text-muted-foreground">Эхлэх он</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="w-[170px]">
            <Label className="text-xs text-muted-foreground">Дуусах он</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className="w-[260px]">
            <Label className="text-xs text-muted-foreground">Хайх</Label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Тайлангийн нэрээр хайх" />
          </div>

          <div className="flex-1" />

          <Button variant="secondary" onClick={() => console.log("export excel (ui only)")}>
            Экселрүү хөрвүүлэх
          </Button>

          <Button onClick={() => setOpen(true)}>+ Дээж шинээр оруулах</Button>
        </div>

        {/* Sample Type Filter Buttons */}
        <div className="flex justify-between">
          <div>
            <div className="text-xs text-center text-muted-foreground">Лаб төрөлөөр хайх</div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                className="text-[13px] w-100% h-7"
                variant={selectedSampleType === "all" ? "default" : "outline"}
                onClick={() => setSelectedSampleType("all")}
              >
                Бүгд
              </Button>
              {sampleType.map((type) => (
                <Button
                  className="text-[13px] w-100% h-7"
                  key={type.id}
                  variant={selectedSampleType === type.type_name ? "default" : "outline"}
                  onClick={() => setSelectedSampleType(type.type_name)}
                >
                  {type.type_name}
                </Button>
                
              ))}
          
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs text-center text-muted-foreground">Тайлангийн төлөвөөр хайх</div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((s) => {
                const active = status === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStatus(s.key)}
                    className={[
                      "rounded-full border px-3 py-1 text-sm transition text-[13px] w-100% h-7",
                      active ? "bg-black text-white border-black" : "bg-white hover:bg-muted",
                    ].join(" ")}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-background text-left mt-[-15px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="">Он сар</TableHead>
              <TableHead className="">№</TableHead>
              <TableHead className=""> Дээжны нэр </TableHead>
              <TableHead className="">Оруулсан дээжүүд</TableHead>
              <TableHead className="">Байршил</TableHead>
              <TableHead className="text-right pr-15">Төлөв</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map((dataItem, index) => (
              <TableRow
                key={dataItem.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => {
                  if (dataItem.status === "tested") {
                    setPdfReportId(dataItem.id);
                    setOpenPdf(true);
                  } else {
                    router.push(`/reports/${dataItem.id}`);
                  }
                }}>
                <TableCell>{dataItem.created_at.slice(0,10)}</TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <button
                    className=" dark:text-sky-400 font-semibold hover:underline text-left"
                    onClick={(e) => {}}
                  >
                    {dataItem.report_title}
                  </button>
                </TableCell>
                <TableCell className="max-w-[420px]">
  <div className="flex flex-wrap gap-1">
    {dataItem.sample_names
      ?.split(",")
      .map((name, i) => (
        <Badge key={i} variant="secondary" className="text-[12px] text-gray-850 bg-gray-200 font-normal border-gray-600">
          <span className=" mr-1">{i + 1}.</span>
          {name.trim()}
        </Badge>
      ))}
  </div>
</TableCell>
                <TableCell>{dataItem.location}</TableCell>
                <TableCell className="text-right">{statusBadge(dataItem.status)}</TableCell>
              </TableRow>
            ))}
            {filtered?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No reports
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Шинэ хүсэлт</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Тайлан</Label>
              <Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Нэгдсэн төв ус гэх мэт..." />
            </div>

            <div className="rounded-xl border p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Дээжний төрөл</Label>
                  <Select
                    value={sampleGroup.sample_type_id ? String(sampleGroup.sample_type_id) : undefined}
                    onValueChange={(v) => setTypeAndDefaults(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Төрөл" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleType.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.type_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>Дээжний нэр</Label>
                    <Button  variant="ghost" size="sm" onClick={addSampleName}>
                      + Дээж нэмэх
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {sampleGroup.sample_names.map((name, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={name}
                          onChange={(e) => updateSampleName(idx, e.target.value)}
                          placeholder={`Дээж ${idx + 1}`}
                        />
                        {sampleGroup.sample_names.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSampleName(idx)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Дээж авсан байршил</Label>
                  <Input 
                    value={sampleGroup.location} 
                    onChange={(e) => setSampleGroup(prev => ({ ...prev, location: e.target.value }))} 
                    placeholder="байршил" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Дээж авсан огноо</Label>
                  <Input 
                    type="date" 
                    value={sampleGroup.sample_date} 
                    onChange={(e) => setSampleGroup(prev => ({ ...prev, sample_date: e.target.value }))} 
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Дээж авсан хүний нэр</Label>
                  <Input 
                    value={sampleGroup.sampled_by} 
                    onChange={(e) => setSampleGroup(prev => ({ ...prev, sampled_by: e.target.value }))} 
                    placeholder="нэр" 
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="font-medium">Шинжилгээ сонгох</div>
                <div className="text-xs text-muted-foreground">
                  {sampleGroup.sample_type_id ? "Сануулсан шинжилгээнүүд" : "Дээжний төрлөө эхлээд сонгоно уу"}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {sampleGroup.sample_type_id ? (
                  sampleGroup.availableIndicators.map((ind) => {
                    const checked = sampleGroup.indicators.includes(ind.id);
                    return (
                      <button
                        type="button"
                        key={ind.id}
                        onClick={() => toggleIndicator(ind.id)}
                        className={[
                          "flex items-center justify-between rounded-lg border px-3 py-2 text-left",
                          checked ? "bg-muted" : "hover:bg-muted/50",
                        ].join(" ")}
                      >
                        <div>
                          <div className="text-sm font-medium">{ind.indicator_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {ind.unit ? `Unit: ${ind.unit}` : "—"}
                          </div>
                        </div>
                        <Badge variant={checked ? "default" : "outline"}>
                          {checked ? "Сонгогдсон" : "Сонгох"}
                        </Badge>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-sm text-muted-foreground py-4">
                    Шинжилгээний цэс.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Болих
            </Button>
            <Button onClick={onCreateClick}>Хадгалах</Button>
          </DialogFooter>
        </DialogContent>
        
        {/* PDF Modal */}
        <Dialog open={openPdf} onOpenChange={setOpenPdf}>
          <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 overflow-hidden" style={{
              width: '800px',
              height: '90vh',
              maxWidth: '1400px',
              maxHeight: '90vh',
            }}>
            <DialogTitle className="sr-only">Report PDF</DialogTitle>
            <div className="w-full h-full">
              {pdfReportId ? (
                <iframe
                  title="Report PDF"
                  className="w-full h-[85vh]"
                  src={`http://localhost:8000/reports/${pdfReportId}/pdf`}
                />
              ) : (
                <div className="p-6">No report selected</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </Dialog>
         <div className="text-sm text-muted-foreground text-right">
          Нийт илэрц : <span className="text-foreground font-medium">{filtered?.length}</span>
        </div>
    </div>
    
  );
}