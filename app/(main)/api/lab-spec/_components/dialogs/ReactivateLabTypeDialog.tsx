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
import { CheckCircle2 } from "lucide-react";

import { LabType } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError, getErrorMessage } from "@/lib/errors";

interface ReactivateLabTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labType: LabType | null;
  onReactivated: () => void;
}

export function ReactivateLabTypeDialog({
  open,
  onOpenChange,
  labType,
  onReactivated,
}: ReactivateLabTypeDialogProps) {
  const [reactivating, setReactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReactivate = async () => {
    if (!labType) return;

    try {
      setError(null);
      setReactivating(true);
      await api.put(ENDPOINTS.LAB_TYPES.REACTIVATE(labType.id), {});
      onReactivated();
      onOpenChange(false);
    } catch (err) {
      logError(err, "Reactivate lab type");
      setError(getErrorMessage(err));
    } finally {
      setReactivating(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Лаб төрлийг идэвхжүүлэх үү?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            {labType && (
              <div className="space-y-3 mt-3 text-slate-600 dark:text-slate-400">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {labType.type_name}
                </p>

                {/* Info Box */}
                <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 space-y-2">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                    Энэ лаб төрлийг идэвхжүүлэхэд:
                  </p>
                  <ul className="text-sm text-green-800 dark:text-green-400 space-y-1 list-disc list-inside">
                    <li>Лаб төрөл идэвхтэй болж, бүх жагсаалтад харагдана</li>
                    <li>Ажилтнуудад дахин хуваарилах боломжтой болно</li>
                    <li>Тайлан үүсгэхэд ашиглах боломжтой болно</li>
                  </ul>
                </div>

                <p className="text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  💡 Санамж: Шинжилгээнүүд нь автоматаар идэвхжихгүй, тусад нь идэвхжүүлэх шаардлагатай
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
            disabled={reactivating}
            className="border-slate-200 dark:border-slate-800"
          >
            Болих
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReactivate}
            disabled={reactivating}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {reactivating ? "Идэвхжүүлж байна..." : "Идэвхжүүлэх"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
