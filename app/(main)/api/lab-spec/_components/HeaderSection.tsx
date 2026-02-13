import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Beaker, Sparkles } from "lucide-react";
import { LabType, NewIndicatorDraft } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";

interface HeaderSectionProps {
  onCreateLabType: () => void;
  labTypes: LabType[];
  selectedLabTypeId?: string;
  onIndicatorCreated: () => void;
}

export function HeaderSection({
  onCreateLabType,
  labTypes,
  selectedLabTypeId = "all",
  onIndicatorCreated,
}: HeaderSectionProps) {
  const [openCreate, setOpenCreate] = useState(false);
  const [draft, setDraft] = useState<NewIndicatorDraft>({
    lab_type_id: null,
    indicator_name: "",
    unit: "",
    test_method: "",
    limit_value: "",
    is_default: false,
  });

  const openCreateModal = () => {
    setDraft({
      lab_type_id:
        selectedLabTypeId === "all" ? null : Number(selectedLabTypeId),
      indicator_name: "",
      unit: "",
      test_method: "",
      limit_value: "",
      is_default: false,
    });
    setOpenCreate(true);
  };

  const onSaveNewIndicator = async () => {
    await api.post(ENDPOINTS.INDICATORS.CREATE, draft);
    setOpenCreate(false);
    onIndicatorCreated();
  };

  return (
    <>
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-2 py-10">
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
                    Сорьцын төрөл → стандарт → холбогдох шинжилгээний жагсаалт
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onCreateLabType}
                variant="outline"
                className="gap-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                Лаб төрөл нэмэх
              </Button>
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
                Сорьцын төрөл
              </Label>
              <Select
                value={draft.lab_type_id ? String(draft.lab_type_id) : ""}
                onValueChange={(v) =>
                  setDraft((p) => ({ ...p, lab_type_id: Number(v) }))
                }
              >
                <SelectTrigger className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Төрөл сонгох" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  {labTypes
                    .filter(
                      (t) =>
                        t.is_active === 1 ||
                        t.is_active === true ||
                        t.is_active === undefined
                    )
                    .map((t) => (
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
              disabled={!draft.lab_type_id || !draft.indicator_name.trim()}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
