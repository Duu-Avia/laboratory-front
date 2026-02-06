"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

import { LabType } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError, getErrorMessage } from "@/lib/errors";

interface DeleteLabTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labType: LabType | null;
  indicatorCount: number;
  onDeleted: () => void;
}

export function DeleteLabTypeDialog({
  open,
  onOpenChange,
  labType,
  indicatorCount,
  onDeleted,
}: DeleteLabTypeDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!labType) return;

    try {
      setError(null);
      setDeleting(true);
      // Backend handles soft delete (deactivate):
      // - Removes user_lab_types entries (users become unassigned)
      // - Sets is_active = 0 on lab_type (soft delete)
      // - Sets is_active = 0 on indicators (if implemented)
      await api.put(ENDPOINTS.LAB_TYPES.DEACTIVATE(labType.id), {});
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      logError(err, "Deactivate lab type");
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Лаб төрлийг идэвхгүй болгох уу?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            {labType && (
              <div className="space-y-3 mt-3 text-slate-600 dark:text-slate-400">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {labType.type_name}
                </p>

                {/* Warning Box */}
                <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-4 space-y-2">
                  <p className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                    Энэ лаб төрлийг идэвхгүй болговол:
                  </p>
                  <ul className="text-sm text-orange-800 dark:text-orange-400 space-y-1 list-disc list-inside">
                    <li>Ажилтнууд автоматаар &quot;Хуваарилагдаагүй&quot; группт шилжинэ</li>
                    {indicatorCount > 0 && (
                      <li>{indicatorCount} шинжилгээ идэвхгүй болно</li>
                    )}
                    <li>Лаб төрөл идэвхгүй болж, бүдэгрэх болно</li>
                    <li>Түүхэн тайлангууд хадгалагдана</li>
                  </ul>
                </div>

                <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  💡 Санамж: Дараа нь &quot;Идэвхжүүлэх&quot; товчоор сэргээх боломжтой
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleting}
            className="border-slate-200 dark:border-slate-800"
          >
            Болих
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {deleting ? "Идэвхгүй болгож байна..." : "Идэвхгүй болгох"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
