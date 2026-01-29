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

import { FilterPill } from "./_components/FilterPill";
import { IndicatorCard } from "./_components/IndicatorCard";
import {
  IndicatorRowForLabSpec,
  NewIndicatorDraft,
  SampleType,
} from "@/types";

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
        selectedType === "all"
          ? true
          : i.sample_type_id === Number(selectedType);
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
    return (
      sampleTypes.find((t) => t.id === typeId)?.type_name ?? `Type #${typeId}`
    );
  }

  function typeStandard(typeId: number) {
    return sampleTypes.find((t) => t.id === typeId)?.standard ?? "";
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
                  <Beaker className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Шинжилгээний бүртгэл
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Дээжний төрөл → стандарт → холбогдох шинжилгээний жагсаалт
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={openCreateModal}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200"
              size="lg"
            >
              <Plus className="h-4 w-4" />
              Шинэ шинжилгээ
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Filters Card */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Type Filter Pills */}
            <div className="space-y-3 flex-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-500" />
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
            <div className="w-full lg:w-96 space-y-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-500" />
                Хайлт
              </label>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="E.coli, ISO, mg/m3..."
                  className="pl-10 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
              <FlaskConical className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Нийт шинжилгээ:{" "}
              <span className="font-bold text-slate-900 dark:text-white text-base">
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
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl py-20 text-center">
              <FlaskConical className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Шинжилгээ олдсонгүй
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Өөр хайлтын утга оруулж үзнэ үү
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Indicator Modal */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Шинэ шинжилгээ нэмэх
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-5 py-5">
            <div className="space-y-2.5 col-span-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Дээжний төрөл
              </Label>
              <Select
                value={draft.sample_type_id ? String(draft.sample_type_id) : ""}
                onValueChange={(v) =>
                  setDraft((p) => ({ ...p, sample_type_id: Number(v) }))
                }
              >
                <SelectTrigger className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Төрөл сонгох" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  {sampleTypes.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5 col-span-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Шинжилгээний нэр
              </Label>
              <Input
                value={draft.indicator_name}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, indicator_name: e.target.value }))
                }
                placeholder="жишээ: E.coli"
                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Нэгж
              </Label>
              <Input
                value={draft.unit}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, unit: e.target.value }))
                }
                placeholder="жишээ: CFU, mg/m3"
                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Зөвш/Хэмжээ
              </Label>
              <Input
                value={draft.limit_value}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, limit_value: e.target.value }))
                }
                placeholder="жишээ: 0, ≤ 12"
                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2.5 col-span-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Арга / Test method
              </Label>
              <Input
                value={draft.test_method}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, test_method: e.target.value }))
                }
                placeholder="жишээ: ISO 9308"
                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="col-span-2">
              <Separator className="my-4 bg-slate-200 dark:bg-slate-800" />
              <button
                type="button"
                onClick={() =>
                  setDraft((p) => ({ ...p, is_default: !p.is_default }))
                }
                className={`w-full rounded-xl border px-5 py-4 text-left transition-all duration-200 ${
                  draft.is_default
                    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                    : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Default болгох
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Энэ төрөл дээр шинэ sample үүсгэхэд санал болгох default
                      indicator
                    </div>
                  </div>
                  <Badge
                    variant={draft.is_default ? "default" : "outline"}
                    className={
                      draft.is_default
                        ? "bg-blue-600 text-white border-0"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }
                  >
                    {draft.is_default ? "ON" : "OFF"}
                  </Badge>
                </div>
              </button>
            </div>
          </div>

          <DialogFooter className="pt-5 border-t border-slate-200/60 dark:border-slate-800/60 gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenCreate(false)}
              className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Болих
            </Button>
            <Button
              onClick={onSaveNewIndicator}
              disabled={!draft.sample_type_id || !draft.indicator_name.trim()}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
