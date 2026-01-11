"use client";

import { useEffect, useState }  from "react";
import Link from "next/link";
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

type ReportStatus = "draft" | "pending" | "completed";

type ReportRow = {
  id: number;
  sample_names:string;
  created_at: string;
  time: string;
  code: string;
  report_title: string;
  workType: string;
  location: string;
  qty?: string;
  status: ReportStatus;
};

type SampleType = { id: number; type_name: string };
type Indicator = { id: number; indicator_name: string; unit?: string; method?: string; limit?: string; is_default?: boolean };

type SampleDraft = {
  tempId: string;
  sample_type_id: number | null;
  sample_name: string;
  location: string;
  sample_date: string;
  sampled_by: string;
  indicators: number[];
  availableIndicators: Indicator[];
};







function statusBadge(status: ReportStatus) {
  const map: Record<ReportStatus, { text: string; variant: "default" | "secondary" | "outline" }> = {
    draft: { text: "Draft", variant: "secondary" },
    pending: { text: "Pending", variant: "outline" },
    completed: { text: "Completed", variant: "default" },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.text}</Badge>;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ReportsPage() {
  // Filters (UI only)
  const [jobType, setJobType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState<string>("2026-01-10");
  const [to, setTo] = useState<string>("2026-01-17");
  const [search, setSearch] = useState<string>("");
  // List data (mock)
  const [data, setData] = useState<ReportRow[]>([]);
  const [indicators, setIndicators] = useState("")
  // Modal
  const [open, setOpen] = useState(false);

  // Create form state
  const [reportTitle, setReportTitle] = useState("");
  const [testStart, setTestStart] = useState(from);
  const [testEnd, setTestEnd] = useState(to);
  const [analyst, setAnalyst] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [sampleType, setSampleType] = useState<SampleType[]>([])
  const [samples, setSamples] = useState<SampleDraft[]>([
    {
      tempId: uid(),
      sample_type_id: null,
      sample_name: "",
      location: "",
      sample_date: from,
      sampled_by: "",
      indicators: [],
      availableIndicators: []
    },
  ]);

  const filtered = data.filter((r) => {
    const matchSearch =
      !search ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.report_title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" ? true : r.status === status;
    const matchJob = jobType === "all" ? true : r.workType === jobType;
    return matchSearch && matchStatus && matchJob;
  });

  // sample type (Air, water) geh met data duudah func
useEffect(()=>{
  fetch(`http://localhost:8000/sample-types`)
  .then((res)=> res.json())
  .then((data)=> setSampleType(data))
  .catch((err)=> console.log(`error while fetching sample type`))
},[])

//sample data fetch function
 useEffect(() => {
  fetch("http://localhost:8000/reports")
    .then(async (res) => {
      const json = await res.json();

      if (!Array.isArray(json)) {
        console.error("Expected array from /reports but got:", json);
        setData([]); // prevent crash
        return;
      }

      setData(json);
    })
    .catch((err) => {
      console.log("error while fetch data", err);
      setData([]);
    });
}, []);


  console.log(data)
//sample nemeh function
  function addSample() {
    setSamples((prev) => [
      ...prev,
      {
        tempId: uid(),
        sample_type_id: null,
        sample_name: "",
        location: "",
        sample_date: testStart,
        sampled_by: "",
        indicators: [],
        availableIndicators:[]
      },
    ]);
  }

  function removeSample(tempId: string) {
    setSamples((prev) => prev.filter((s) => s.tempId !== tempId));
  }

  function updateSample(tempId: string, patch: Partial<SampleDraft>) {
    setSamples((prev) => prev.map((s) => (s.tempId === tempId ? { ...s, ...patch } : s)));
  }

  async function setTypeAndDefaults(tempId: string, typeId: number) {
  updateSample(tempId, { sample_type_id: typeId, indicators: [], availableIndicators: [] });

  try {
    const res = await fetch(`http://localhost:8000/sample/indicators/${typeId}`);
    if (!res.ok) throw new Error("Failed to load indicators");

    const indicators: Indicator[] = await res.json();

    // default selections based on DB is_default
    const defaultIds = indicators
      .filter((i) => i.is_default)
      .map((i) => i.id);

    updateSample(tempId, {
      sample_type_id: typeId,
      availableIndicators: indicators,
      indicators:[],
    });
  } catch (err) {
    console.error(err);
    // keep type set but no indicators
    updateSample(tempId, { sample_type_id: typeId, availableIndicators: [], indicators: [] });
  }
}


  function toggleIndicator(tempId: string, indicatorId: number) {
    setSamples((prev) =>
      prev.map((s) => {
        if (s.tempId !== tempId) return s;
        const exists = s.indicators.includes(indicatorId);
        return { ...s, indicators: exists ? s.indicators.filter((x) => x !== indicatorId) : [...s.indicators, indicatorId] };
      })
    );
  }

  const onCreateClick = async() => {
    // UI only: you will replace with fetch to POST /reports
    const payload = {
      report_title: reportTitle,
      test_start_date: testStart,
      test_end_date: testEnd,
      analyst,
      approved_by: approvedBy,
      samples: samples.map((s) => ({
        sample_type_id: s.sample_type_id,
        sample_name: s.sample_name,
        location: s.location,
        sample_date: s.sample_date,
        sampled_by: s.sampled_by,
        indicators: s.indicators,
      })),
    };

    try{
      const response = await fetch(`http://localhost:8000/reports/create`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
      });
      
    }catch(error){
      console.log("error while creating sample")
    }
    console.log("CREATE REPORT payload (UI only):", payload);
    setOpen(false);
  }
  console.log(data)
  return (
    <div className="p-6 space-y-5">
      {/* Top filters row (like your screenshot) */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-[180px]">
            <Label className="text-xs text-muted-foreground">Job type</Label>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Earth work">Earth work</SelectItem>
                <SelectItem value="Concrete">Concrete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[180px]">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
          </div>

          <div className="w-[170px]">
            <Label className="text-xs text-muted-foreground">Start date</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="w-[170px]">
            <Label className="text-xs text-muted-foreground">End date</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className="w-[260px]">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code or title..." />
          </div>

          <div className="flex-1" />

          <Button variant="secondary" onClick={() => console.log("export excel (ui only)")}>
            Export Excel
          </Button>

          <Button onClick={() => setOpen(true)}>+ Дээж шинээр оруулах</Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Found: <span className="text-foreground">{data?.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Он сар</TableHead>
              <TableHead className="w-[120px]">Дугаар</TableHead>
              <TableHead>Дээжны нэр</TableHead>
              <TableHead className="w-[160px]">Оруулсан дээжүүд</TableHead>
              <TableHead className="w-[200px]">Байршил</TableHead>
              <TableHead className="w-[120px] text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((dataItem) => (
              <TableRow key={dataItem.id}className="hover:bg-muted/50">
                <TableCell>{dataItem.created_at.slice(0,10)}</TableCell>
                <TableCell>{dataItem.id}</TableCell>
                <TableCell>
                  <Link className="text-blue-600 hover:underline" href={`/reports/${dataItem.id}`}>
                    {dataItem.report_title}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[420px] truncate">{dataItem.sample_names}</TableCell>
                <TableCell>{dataItem.workType}</TableCell>
                <TableCell>{dataItem.location}</TableCell>
                <TableCell>{dataItem.qty || "-"}</TableCell>
                <TableCell className="text-right">{statusBadge(dataItem.status)}</TableCell>
              </TableRow>
            ))}
            {data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
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
            <DialogTitle>New Report</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Report title</Label>
              <Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="e.g., Building A - Water test" />
            </div>
            {/* <div className="space-y-2">
              <Label>Analyst</Label>
              <Input value={analyst} onChange={(e) => setAnalyst(e.target.value)} placeholder="Analyst name" />
            </div>

            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="date" value={testStart} onChange={(e) => setTestStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Input type="date" value={testEnd} onChange={(e) => setTestEnd(e.target.value)} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Approved by</Label>
              <Input value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} placeholder="Approver name (optional)" />
            </div> */}
          </div>

          {/* <Separator className="my-4" /> */}

          <div className="flex items-center justify-between">
            <div className="font-medium">Samples</div>
            <Button variant="secondary" onClick={addSample}>
              + Add sample
            </Button>
          </div>

          <div className="space-y-4 mt-3 max-h-[52vh] overflow-auto pr-1">
            {samples.map((s, idx) => {
              const indicators = s.availableIndicators ?? [];;
              return (
                <div key={s.tempId} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">Sample #{idx + 1}</div>
                    {samples.length > 1 && (
                      <Button variant="ghost" onClick={() => removeSample(s.tempId)}>
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={s.sample_type_id ? String(s.sample_type_id) : undefined}
                        onValueChange={(v) => setTypeAndDefaults(s.tempId, Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                      <Label>Sample name</Label>
                      <Input
                        value={s.sample_name}
                        onChange={(e) => updateSample(s.tempId, { sample_name: e.target.value })}
                        placeholder="e.g., Kitchen water / Toilet water"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Location</Label>
                      <Input value={s.location} onChange={(e) => updateSample(s.tempId, { location: e.target.value })} placeholder="e.g., Building A - Kitchen" />
                    </div>

                    <div className="space-y-2">
                      <Label>Sample date</Label>
                      <Input type="date" value={s.sample_date} onChange={(e) => updateSample(s.tempId, { sample_date: e.target.value })} />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Sampled by</Label>
                      <Input value={s.sampled_by} onChange={(e) => updateSample(s.tempId, { sampled_by: e.target.value })} placeholder="Collector name" />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="font-medium">Шинжилгээ сонгох</div>
                    <div className="text-xs text-muted-foreground">
                      {s.sample_type_id ? "Defaults are pre-selected" : "Choose sample type first"}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {s.sample_type_id ? (
                      indicators.map((ind) => {
                        const checked = s.indicators.includes(ind.id);
                        return (
                          <button
                            type="button"
                            key={ind.id}
                            onClick={() => toggleIndicator(s.tempId, ind.id)}
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
                            <Badge variant={checked ? "default" : "outline"}>{checked ? "Сонгогдсон" : "Сонгох"}</Badge>
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-sm text-muted-foreground py-4">
                        Select a sample type to load indicators.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onCreateClick}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
