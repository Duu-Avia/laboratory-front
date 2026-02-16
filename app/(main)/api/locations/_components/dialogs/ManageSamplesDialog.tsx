import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Trash2, Loader2 } from "lucide-react";
import { LocationPackage, LocationSample } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError, getErrorMessage } from "@/lib/errors";

interface ManageSamplesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: LocationPackage | null;
  onUpdated: () => void;
}

export function ManageSamplesDialog({
  open,
  onOpenChange,
  location,
  onUpdated,
}: ManageSamplesDialogProps) {
  const [newSampleName, setNewSampleName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [addedSamples, setAddedSamples] = useState<LocationSample[]>([]);

  const samples = [
    ...(location?.samples ?? []).filter((s) => !deletedIds.has(s.id)),
    ...addedSamples,
  ];

  const handleAddSample = async () => {
    if (!location || !newSampleName.trim()) return;

    try {
      setError(null);
      setAdding(true);
      const allSamples = location?.samples ?? [];
      const nextSortOrder =
        allSamples.length > 0
          ? Math.max(...allSamples.map((s) => s.sort_order)) + 1
          : 1;

      const created = await api.post<LocationSample>(
        ENDPOINTS.LOCATIONS.CREATE_SAMPLE(location.id),
        {
          location_name: newSampleName.trim(),
          sort_order: nextSortOrder,
        }
      );

      setAddedSamples((prev) => [
        ...prev,
        {
          id: created.id ?? Date.now(),
          location_name: newSampleName.trim(),
          sort_order: nextSortOrder,
        },
      ]);
      setNewSampleName("");
      onUpdated();
    } catch (err) {
      logError(err, "Create sample");
      setError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSample = async (sampleId: number) => {
    if (!location) return;

    try {
      setError(null);
      setDeletingId(sampleId);
      await api.put(ENDPOINTS.LOCATIONS.DELETE_SAMPLE(sampleId));
      setDeletedIds((prev) => new Set(prev).add(sampleId));
      onUpdated();
    } catch (err) {
      logError(err, "Delete sample");
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setNewSampleName("");
          setError(null);
          setDeletedIds(new Set());
          setAddedSamples([]);
        }
      }}
    >
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
              <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Байршлын цэгүүд
              </DialogTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {location?.package_name}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Add New Sample */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Шинэ байршил нэмэх
            </Label>
            <div className="flex gap-2">
              <Input
                value={newSampleName}
                onChange={(e) => setNewSampleName(e.target.value)}
                placeholder="жишээ: Цэг 1"
                className="flex-1 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSampleName.trim()) {
                    handleAddSample();
                  }
                }}
              />
              <Button
                onClick={handleAddSample}
                disabled={!newSampleName.trim() || adding}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Нэмэх
              </Button>
            </div>
          </div>

          {/* Samples List */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Байршлын жагсаалт ({samples.length})
            </Label>

            {samples.length === 0 ? (
              <div className="p-8 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-center">
                <MapPin className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Байршлын цэг одоогоор байхгүй байна
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {samples
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((sample) => (
                    <div
                      key={sample.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {sample.sort_order}
                      </span>
                      <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white">
                        {sample.location_name}
                      </span>
                      <Button
                        onClick={() => handleDeleteSample(sample.id)}
                        disabled={deletingId === sample.id}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-400"
                      >
                        {deletingId === sample.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
