import { LocationPackage } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trash2, Package, Plus } from "lucide-react";

interface LocationCardProps {
  location: LocationPackage;
  labTypeName: string;
  onDelete: () => void;
  onManageSamples?: () => void;
}

export function LocationCard({
  location,
  labTypeName,
  onDelete,
  onManageSamples,
}: LocationCardProps) {
  const sampleCount = location.samples?.length ?? 0;

  return (
    <div className="group rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 shrink-0">
            <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">
              {location.package_name}
            </h3>
            <Badge
              variant="outline"
              className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
            >
              <MapPin className="h-3 w-3 mr-1" />
              {labTypeName}
            </Badge>
          </div>
        </div>
      </div>

      {/* Samples List */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Байршлын цэгүүд
          </span>
          <Badge variant="outline" className="text-xs">
            {sampleCount}
          </Badge>
        </div>

        {sampleCount > 0 ? (
          <div className="max-h-32 overflow-y-auto space-y-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
            {location.samples
              ?.sort((a, b) => a.sort_order - b.sort_order)
              .map((sample) => (
                <div
                  key={sample.id}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <span className="text-xs text-slate-400 font-mono w-6">
                    {sample.sort_order}.
                  </span>
                  <span className="flex-1">{sample.location_name}</span>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Байршлын цэг нэмээгүй байна
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onManageSamples && (
          <Button
            onClick={onManageSamples}
            variant="outline"
            size="sm"
            className="flex-1 gap-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-400"
          >
            <Plus className="h-3.5 w-3.5" />
            Цэг удирдах
          </Button>
        )}
        <Button
          onClick={onDelete}
          variant="outline"
          size="sm"
          className={`gap-2 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-400 ${
            onManageSamples ? "flex-1" : "w-full"
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Устгах
        </Button>
      </div>
    </div>
  );
}
