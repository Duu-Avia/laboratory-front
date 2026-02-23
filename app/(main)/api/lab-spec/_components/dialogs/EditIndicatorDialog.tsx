"use client";

import { useEffect, useState } from "react";
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
import { Pencil, AlertCircle, Save, CheckCircle } from "lucide-react";

import { IndicatorRowForLabSpec } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError, getErrorMessage } from "@/lib/errors";

interface EditIndicatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indicator: IndicatorRowForLabSpec | null;
  onUpdated: () => void;
}

export function EditIndicatorDialog({
  open,
  onOpenChange,
  indicator,
  onUpdated,
}: EditIndicatorDialogProps) {
  const [indicatorName, setIndicatorName] = useState("");
  const [unit, setUnit] = useState("");
  const [testMethod, setTestMethod] = useState("");
  const [limitValue, setLimitValue] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open && indicator) {
      setIndicatorName(indicator.indicator_name);
      setUnit(indicator.unit ?? "");
      setTestMethod(indicator.test_method ?? "");
      setLimitValue(indicator.limit_value ?? "");
      setIsDefault(Boolean(indicator.is_default));
      setError(null);
      setSuccess(false);
    }
  }, [open, indicator]);

  const handleSave = async () => {
    if (!indicator) return;
    if (!indicatorName.trim()) {
      setError("Шинжилгээний нэр хоосон байна");
      return;
    }

    try {
      setError(null);
      setSuccess(false);
      setSaving(true);
      await api.put(ENDPOINTS.INDICATORS.UPDATE(indicator.id), {
        indicator_name: indicatorName.trim(),
        unit: unit.trim(),
        test_method: testMethod.trim(),
        limit_value: limitValue.trim(),
        is_default: isDefault,
      });
      setSuccess(true);
      onUpdated();
    } catch (err) {
      logError(err, "Update indicator");
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
              <Pencil className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Шинжилгээ засах
              </DialogTitle>
              {indicator && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {indicator.indicator_name}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-5 py-5">
          <div className="space-y-2.5 col-span-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Шинжилгээний нэр
            </Label>
            <Input
              value={indicatorName}
              onChange={(e) => {
                setIndicatorName(e.target.value);
                setError(null);
                setSuccess(false);
              }}
              placeholder="жишээ: E.coli"
              className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Нэгж
            </Label>
            <Input
              value={unit}
              onChange={(e) => { setUnit(e.target.value); setSuccess(false); }}
              placeholder="жишээ: CFU, mg/m3"
              className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Зөвш / Хэмжээ
            </Label>
            <Input
              value={limitValue}
              onChange={(e) => { setLimitValue(e.target.value); setSuccess(false); }}
              placeholder="жишээ: 0, ≤ 12"
              className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2.5 col-span-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Арга / Test method
            </Label>
            <Input
              value={testMethod}
              onChange={(e) => { setTestMethod(e.target.value); setSuccess(false); }}
              placeholder="жишээ: ISO 9308"
              className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="col-span-2">
            <Separator className="my-4 bg-slate-200 dark:bg-slate-800" />
            <button
              type="button"
              onClick={() => { setIsDefault((p) => !p); setSuccess(false); }}
              className={`w-full rounded-xl border px-5 py-4 text-left transition-all duration-200 ${
                isDefault
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
                  variant={isDefault ? "default" : "outline"}
                  className={
                    isDefault
                      ? "bg-blue-600 text-white border-0"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }
                >
                  {isDefault ? "ON" : "OFF"}
                </Badge>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 p-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Амжилттай хадгалагдлаа
          </div>
        )}

        <DialogFooter className="pt-5 border-t border-slate-200/60 dark:border-slate-800/60 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            Хаах
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !indicatorName.trim()}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
