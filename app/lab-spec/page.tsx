"use client";
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


import { Plus, Search, FlaskConical, Beaker, Sparkles } from "lucide-react";
import { IndicatorRowForLabSpec, NewIndicatorDraft, SampleType } from "../types/types";
import { FilterPill } from "./_components/FilterPill";
import { IndicatorCard } from "./_components/IndicatorCard";

export default function LabPage() {
  // data (UI only, you will fetch)
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
  const [indicators, setIndicators] = useState<IndicatorRowForLabSpec[]>([]);

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

  useEffect(() => {
    fetch(`http://localhost:8000/sample-types`)
      .then((response) => response.json())
      .then((data) => setSampleTypes(data))
      .catch((error) =>
        console.log(`error while fetching sample types`, error.message)
      );
  }, []);

  useEffect(() => {
    fetch(`http://localhost:8000/indicators`)
      .then((response) => response.json())
      .then((data) => setIndicators(data))
      .catch((error) =>
        console.log(`error while fetching indicators`, error.message)
      );
  }, []);

  const typeButtons = useMemo(() => {
    return [
      { key: "all", label: "Бүгд" },
      ...sampleTypes.map((t) => ({ key: String(t.id), label: t.type_name })),
    ];
  }, [sampleTypes]);

  const filteredIndicators = useMemo(() => {
    const q = search.trim().toLowerCase();

    return indicators.filter((i) => {
      const matchType =
        selectedType === "all" ? true : i.sample_type_id === Number(selectedType);
      const matchSearch =
        !q ||
        i.indicator_name?.toLowerCase().includes(q) ||
        (i.test_method ?? "").toLowerCase().includes(q) ||
        (i.unit ?? "").toLowerCase().includes(q) ||
        (i.limit_value ?? "").toLowerCase().includes(q);

      return matchType && matchSearch;
    });
  }, [indicators, selectedType, search]);

  const grouped = useMemo(() => {
    const map = new Map<number, IndicatorRowForLabSpec[]>();
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
    const response = await fetch(
      `http://localhost:8000/indicators/create-indicator`,
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(draft),
      }
    );
    console.log("CREATE INDICATOR payload:", draft);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Beaker className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Шинжилгээний бүртгэл
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Дээжний төрөл → стандарт → холбогдох шинжилгээний жагсаалт
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={openCreateModal}
              className="gap-2 shadow-soft"
              size="lg"
            >
              <Plus className="h-4 w-4" />
              Шинэ шинжилгээ
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Filters Card */}
        <div className="rounded-xl border border-border bg-card shadow-card p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Type Filter Pills */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Лаб төрлөөр шүүх
              </label>
              <div className="flex flex-wrap gap-2">
                {typeButtons.map((b) => (
                  <FilterPill
                    key={b.key}
                    label={b.label}
                    active={selectedType === b.key}
                    onClick={() => setSelectedType(b.key)}
                  />
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="w-full lg:w-80 space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Хайлт
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="E.coli, ISO, mg/m3..."
                  className="pl-10 bg-background"
                />
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Нийт шинжилгээ:{" "}
              <span className="font-semibold text-foreground">
                {filteredIndicators.length}
              </span>
            </span>
          </div>
        </div>

        {/* Grouped Indicator Cards */}
        <div className="space-y-5">
          {Array.from(grouped.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([typeId, items]) => (
              <IndicatorCard
                key={typeId}
                typeName={typeName(typeId)}
                standard={typeStandard(typeId)}
                items={items}
              />
            ))}

          {filteredIndicators.length === 0 && (
            <div className="rounded-xl border border-border bg-card shadow-card py-16 text-center">
              <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                Шинжилгээ олдсонгүй
              </h3>
              <p className="text-sm text-muted-foreground">
                Өөр хайлтын утга оруулж үзнэ үү
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Indicator Modal */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader className="pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">Шинэ шинжилгээ нэмэх</DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-5 py-4">
            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium">Дээжний төрөл</Label>
              <Select
                value={draft.sample_type_id ? String(draft.sample_type_id) : ""}
                onValueChange={(v) =>
                  setDraft((p) => ({ ...p, sample_type_id: Number(v) }))
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Төрөл сонгох" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {sampleTypes.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium">Шинжилгээний нэр</Label>
              <Input
                value={draft.indicator_name}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, indicator_name: e.target.value }))
                }
                placeholder="жишээ: E.coli"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Нэгж</Label>
              <Input
                value={draft.unit}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, unit: e.target.value }))
                }
                placeholder="жишээ: CFU, mg/m3"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Зөвш/Хэмжээ</Label>
              <Input
                value={draft.limit_value}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, limit_value: e.target.value }))
                }
                placeholder="жишээ: 0, ≤ 12"
                className="bg-background"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium">Арга / Test method</Label>
              <Input
                value={draft.test_method}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, test_method: e.target.value }))
                }
                placeholder="жишээ: ISO 9308"
                className="bg-background"
              />
            </div>

            <div className="col-span-2">
              <Separator className="my-3" />
              <button
                type="button"
                onClick={() => setDraft((p) => ({ ...p, is_default: !p.is_default }))}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                  draft.is_default
                    ? "bg-primary/5 border-primary/30"
                    : "bg-background border-border hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Default болгох
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Энэ төрөл дээр шинэ sample үүсгэхэд санал болгох default
                      indicator
                    </div>
                  </div>
                  <Badge
                    variant={draft.is_default ? "default" : "outline"}
                    className={
                      draft.is_default
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }
                  >
                    {draft.is_default ? "ON" : "OFF"}
                  </Badge>
                </div>
              </button>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border gap-2">
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Болих
            </Button>
            <Button
              onClick={onSaveNewIndicator}
              disabled={!draft.sample_type_id || !draft.indicator_name.trim()}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
