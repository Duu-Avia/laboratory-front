"use client"
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SampleType = {
  id: number;
  type_name: string;
  standard?: string | null;
};

type IndicatorRow = {
  id: number;
  sample_type_id: number;
  indicator_name: string;
  unit?: string | null;
  test_method?: string | null;
  limit_value?: string | null;
  is_default?: boolean | number | null;
};

type NewIndicatorDraft = {
  sample_type_id: number | null;
  indicator_name: string;
  unit: string;
  test_method: string;
  limit_value: string;
  is_default: boolean;
};
export default function LabPage(){
  // data (UI only, you will fetch)
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
  const [indicators, setIndicators] = useState<IndicatorRow[]>([]);
  const [newIndicator, setNewIndicator] = useState()

  // filters
  const [selectedType, setSelectedType] = useState<string>("all");
  const [search, setSearch] = useState("");

  // modal
  const [openCreate, setOpenCreate] = useState(false);
  const [draft, setDraft] = useState<NewIndicatorDraft>({
    sample_type_id: null,
    indicator_name: "",
    unit: "",
    test_method: "",
    limit_value: "",
    is_default: false,
  });

  console.log(sampleTypes, "sample types")
  console.log(indicators, )
  useEffect(() => {
   
      fetch(`http://localhost:8000/sample-types`)
      .then((response)=>response.json())
      .then((data)=> setSampleTypes(data))
      .catch((error)=>console.log(`error while fetching sample types`, error.message))

  }, []);

  useEffect(() => {
    fetch(`http://localhost:8000/indicators`)
    .then((response)=> response.json())
    .then((data)=> setIndicators(data))
    .catch((error)=>console.log(`error while fetching indicators`, error.message))
  }, []);
  // ---------------------------

  const typeButtons = useMemo(() => {
    return [
      { key: "all", label: "Бүгд" },
      ...sampleTypes.map((t) => ({ key: String(t.id), label: t.type_name })),
    ];
  }, [sampleTypes]);

  const filteredIndicators = useMemo(() => {
    const q = search.trim().toLowerCase();

    return indicators.filter((i) => {
      const matchType = selectedType === "all" ? true : i.sample_type_id === Number(selectedType);
      const matchSearch =
        !q ||
        i.indicator_name?.toLowerCase().includes(q) ||
        (i.test_method ?? "").toLowerCase().includes(q) ||
        (i.unit ?? "").toLowerCase().includes(q) ||
        (i.limit_value ?? "").toLowerCase().includes(q);

      return matchType && matchSearch;
    });
  }, [indicators, selectedType, search]);

  // group indicators under each type (for “related between each other” view)
  const grouped = useMemo(() => {
    const map = new Map<number, IndicatorRow[]>();
    for (const i of filteredIndicators) {
      if (!map.has(i.sample_type_id)) map.set(i.sample_type_id, []);
      map.get(i.sample_type_id)!.push(i);
    }
    return map;
  }, [filteredIndicators]);

  function openCreateModal() {
    setDraft({
      sample_type_id: selectedType === "all" ? null : Number(selectedType),
      indicator_name: "",
      unit: "",
      test_method: "",
      limit_value: "",
      is_default: false,
    });
    setOpenCreate(true);
  }

  async function onSaveNewIndicator() {
    // UI ONLY: you will POST to backend
  const response = await fetch(`http://localhost:8000/indicators/create-indicator`,{
    method: "POST",
    headers:{"Content-type":"application/json"},
    body:JSON.stringify(draft)
  })
    console.log("CREATE INDICATOR payload:", draft);
    // optional UI append mock:
    if (draft.sample_type_id && draft.indicator_name.trim()) {
      setIndicators((prev) => [
        ...prev,
        {
          id: Math.floor(Math.random() * 100000),
          sample_type_id: draft.sample_type_id!,
          indicator_name: draft.indicator_name.trim(),
          unit: draft.unit || null,
          test_method: draft.test_method || null,
          limit_value: draft.limit_value || null,
          is_default: draft.is_default ? 1 : 0,
        },
      ]);
    }

    setOpenCreate(false);
  }

  function typeName(typeId: number) {
    return sampleTypes.find((t) => t.id === typeId)?.type_name ?? `Type #${typeId}`;
  }

  function typeStandard(typeId: number) {
    return sampleTypes.find((t) => t.id === typeId)?.standard ?? "";
  }
  console.log(draft,"savelsen shine indicator utguud")
  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="text-2xl font-semibold">Шинжилгээний бүртгэл</div>
          <div className="text-sm text-muted-foreground">
            Дээжний төрөл → стандарт → холбогдох шинжилгээний жагсаалт
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={openCreateModal}>+ Шинэ шинжилгээ</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-background p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Лаб төрөлөөр хайх</div>
            <div className="flex flex-wrap gap-2">
              {typeButtons.map((b) => {
                const active = selectedType === b.key;
                return (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setSelectedType(b.key)}
                    className={[
                      "rounded-full border px-3 py-1 text-sm transition",
                      active ? "bg-black text-white border-black" : "bg-white hover:bg-muted",
                    ].join(" ")}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-[320px]">
            <Label className="text-xs text-muted-foreground">Хайх (шинжилгээ / арга / нэгж)</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="жишээ: E.coli, ISO, mg/m3..."
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Нийт лаборатори төрөл: <span className="text-foreground">{filteredIndicators.length}</span>
        </div>
      </div>

      {/* Related view: grouped by sample type */}
      <div className="space-y-4">
        {Array.from(grouped.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([typeId, items]) => (
            <div key={typeId} className="rounded-xl border bg-background">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{typeName(typeId)}</div>
                  {typeStandard(typeId) ? (
                    <Badge variant="secondary" className="font-normal">
                      Стандарт: {typeStandard(typeId)}
                    </Badge>
                  ) : null}
                </div>

                <div className="text-sm text-muted-foreground">
                  Шинжилгээ: <span className="text-foreground">{items.length}</span>
                </div>
              </div>

              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Шинжилгээ</TableHead>
                      <TableHead className="w-[120px]">Нэгж</TableHead>
                      <TableHead className="w-[220px]">Арга стандарт</TableHead>
                      <TableHead className="w-[180px]">Зөвш / хэмжээ</TableHead>
                      <TableHead className="w-[140px] text-right">Default</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((i) => (
                      <TableRow key={i.id} className="hover:bg-muted/50">
                        <TableCell className="text-muted-foreground">{i.id}</TableCell>
                        <TableCell className="font-medium">{i.indicator_name}</TableCell>
                        <TableCell>{i.unit || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{i.test_method || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{i.limit_value || "-"}</TableCell>
                        <TableCell className="text-right">
                          {i.is_default ? (
                            <Badge className="bg-blue-500 text-white" variant="default">
                              Default
                            </Badge>
                          ) : (
                            <Badge variant="outline">—</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          No indicators
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}

        {filteredIndicators.length === 0 && (
          <div className="rounded-xl border bg-background py-12 text-center text-muted-foreground">
            No indicators found
          </div>
        )}
      </div>

      {/* Create Indicator Modal (UI only) */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Шинэ шинжилгээ нэмэх</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Дээжний төрөл</Label>
              <Select
                value={draft.sample_type_id ? String(draft.sample_type_id) : ""}
                onValueChange={(v) => setDraft((p) => ({ ...p, sample_type_id: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Төрөл сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {sampleTypes.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Шинжилгээний нэр</Label>
              <Input
                value={draft.indicator_name}
                onChange={(e) => setDraft((p) => ({ ...p, indicator_name: e.target.value }))}
                placeholder="жишээ: E.coli"
              />
            </div>

            <div className="space-y-2">
              <Label>Нэгж</Label>
              <Input
                value={draft.unit}
                onChange={(e) => setDraft((p) => ({ ...p, unit: e.target.value }))}
                placeholder="жишээ: CFU, mg/m3"
              />
            </div>

            <div className="space-y-2">
              <Label>Зөвш/Хэмжээ</Label>
              <Input
                value={draft.limit_value}
                onChange={(e) => setDraft((p) => ({ ...p, limit_value: e.target.value }))}
                placeholder="жишээ: 0, ≤ 12"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Арга / Test method</Label>
              <Input
                value={draft.test_method}
                onChange={(e) => setDraft((p) => ({ ...p, test_method: e.target.value }))}
                placeholder="жишээ: ISO 9308"
              />
            </div>

            <div className="col-span-2">
              <Separator className="my-2" />
              <button
                type="button"
                onClick={() => setDraft((p) => ({ ...p, is_default: !p.is_default }))}
                className={[
                  "w-full rounded-lg border px-3 py-2 text-left transition",
                  draft.is_default ? "bg-muted" : "hover:bg-muted/50",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Default болгох</div>
                    <div className="text-xs text-muted-foreground">
                      Энэ төрөл дээр шинэ sample үүсгэхэд санал болгох default indicator
                    </div>
                  </div>
                  <Badge variant={draft.is_default ? "default" : "outline"}>
                    {draft.is_default ? "ON" : "OFF"}
                  </Badge>
                </div>
              </button>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setOpenCreate(false)}>
              Болих
            </Button>
            <Button onClick={onSaveNewIndicator} disabled={!draft.sample_type_id || !draft.indicator_name.trim()}>
              Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
