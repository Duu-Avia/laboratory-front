import type { DeleteDialogProps } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import { getErrorMessage, logError } from "@/lib/errors";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useState } from "react";

export function DeleteDialog({
  deleteDialogOpener,
  reportId,
  setDeleteDialogOpener,
  onDeleted,
}: DeleteDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onDeleteClick = async () => {
    if (!reportId) {
      setError("Устгах тайлан сонгогдоогүй байна");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await api.put(ENDPOINTS.REPORTS.DELETE(reportId));
      setDeleteDialogOpener(false);
      onDeleted?.();
    } catch (err) {
      logError(err, "Delete report");
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={deleteDialogOpener} onOpenChange={setDeleteDialogOpener}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
          <AlertDialogDescription>
            Энэ үйлдлийг буцаах боломжгүй. Тайлан бүрмөсөн устгагдах болно.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Болих</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDeleteClick}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Устгаж байна..." : "Устгах"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
