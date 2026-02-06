"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Pencil, AlertCircle, CheckCircle } from "lucide-react";

import { LabType } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError, getErrorMessage } from "@/lib/errors";

interface EditLabTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labType: LabType | null;
  onUpdated: () => void;
}

export function EditLabTypeDialog({
  open,
  onOpenChange,
  labType,
  onUpdated,
}: EditLabTypeDialogProps) {
  // Type Name state
  const [typeName, setTypeName] = useState("");
  const [typeNameSaving, setTypeNameSaving] = useState(false);
  const [typeNameError, setTypeNameError] = useState<string | null>(null);
  const [typeNameSuccess, setTypeNameSuccess] = useState(false);

  // Standard state
  const [standard, setStandard] = useState("");
  const [standardSaving, setStandardSaving] = useState(false);
  const [standardError, setStandardError] = useState<string | null>(null);
  const [standardSuccess, setStandardSuccess] = useState(false);

  // Load data when dialog opens
  useEffect(() => {
    if (open && labType) {
      setTypeName(labType.type_name);
      setStandard(labType.standard);
      // Reset all success/error states
      setTypeNameError(null);
      setTypeNameSuccess(false);
      setStandardError(null);
      setStandardSuccess(false);
    }
  }, [open, labType]);

  const handleTypeNameSave = async () => {
    if (!typeName.trim()) {
      setTypeNameError("Төрлийн нэр хоосон байна");
      return;
    }

    if (!labType) return;

    try {
      setTypeNameError(null);
      setTypeNameSuccess(false);
      setTypeNameSaving(true);
      await api.put(ENDPOINTS.LAB_TYPES.UPDATE(labType.id), {
        type_name: typeName.trim(),
      });
      setTypeNameSuccess(true);
      onUpdated();
    } catch (err) {
      logError(err, "Update lab type name");
      setTypeNameError(getErrorMessage(err));
    } finally {
      setTypeNameSaving(false);
    }
  };

  const handleStandardSave = async () => {
    if (!standard.trim()) {
      setStandardError("Стандарт хоосон байна");
      return;
    }

    if (!labType) return;

    try {
      setStandardError(null);
      setStandardSuccess(false);
      setStandardSaving(true);
      await api.put(ENDPOINTS.LAB_TYPES.UPDATE(labType.id), {
        standard: standard.trim(),
      });
      setStandardSuccess(true);
      onUpdated();
    } catch (err) {
      logError(err, "Update lab type standard");
      setStandardError(getErrorMessage(err));
    } finally {
      setStandardSaving(false);
    }
  };

  const typeNameChanged = labType && typeName.trim() !== labType.type_name;
  const standardChanged = labType && standard.trim() !== labType.standard;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
              <Pencil className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Лаб төрөл засах
              </DialogTitle>
              {labType && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {labType.type_name}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Type Name Section */}
          <div className="space-y-4">
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Төрлийн нэр
              </Label>
              <Input
                value={typeName}
                onChange={(e) => {
                  setTypeName(e.target.value);
                  setTypeNameError(null);
                  setTypeNameSuccess(false);
                }}
                placeholder="Төрлийн нэр"
                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {typeNameError && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-2 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {typeNameError}
                </div>
              )}
              {typeNameSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-100 p-2 text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  Амжилттай хадгалагдлаа
                </div>
              )}
            </div>
            <Button
              onClick={handleTypeNameSave}
              disabled={!typeNameChanged || typeNameSaving}
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {typeNameSaving ? "Хадгалж байна..." : "Нэр хадгалах"}
            </Button>
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          {/* Standard Section */}
          <div className="space-y-4">
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Стандарт
              </Label>
              <Input
                value={standard}
                onChange={(e) => {
                  setStandard(e.target.value);
                  setStandardError(null);
                  setStandardSuccess(false);
                }}
                placeholder="Стандарт"
                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {standardError && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-2 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {standardError}
                </div>
              )}
              {standardSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-100 p-2 text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  Амжилттай хадгалагдлаа
                </div>
              )}
            </div>
            <Button
              onClick={handleStandardSave}
              disabled={!standardChanged || standardSaving}
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {standardSaving ? "Хадгалж байна..." : "Стандарт хадгалах"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
