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
import { Trash2 } from "lucide-react";
import { LocationPackage } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError, getErrorMessage } from "@/lib/errors";

interface DeleteLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: LocationPackage | null;
  onDeleted: () => void;
}

export function DeleteLocationDialog({
  open,
  onOpenChange,
  location,
  onDeleted,
}: DeleteLocationDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!location) return;

    try {
      setError(null);
      setDeleting(true);
      await api.put(ENDPOINTS.LOCATIONS.DELETE(location.id));
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      logError(err, "Delete location package");
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setError(null);
        }
      }}
    >
      <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <AlertDialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Багц устгах
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
            {location && (
              <>
                <span className="font-bold text-slate-900 dark:text-white">
                  {location.package_name}
                </span>{" "}
                багцыг устгахдаа итгэлтэй байна уу?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400 p-3 text-sm">
          Энэ үйлдэл буцаах боломжгүй. Багцтай холбоотой бүх Сорьцийн байршлууд
          мөн устгагдана.
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900">
            Болих
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {deleting ? "Устгаж байна..." : "Устгах"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
