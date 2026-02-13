import { IndicatorRowForLabSpec } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, RotateCcw } from "lucide-react";

interface InactiveLabTypeCardProps {
  typeName: string;
  standard?: string;
  items: IndicatorRowForLabSpec[];
  onReactivate?: () => void;
}

export function InactiveLabTypeCard({
  typeName,
  standard,
  items,
  onReactivate,
}: InactiveLabTypeCardProps) {
  return (
    <div className="rounded-xl border border-orange-200/60 dark:border-orange-700/60 bg-white/60 dark:bg-slate-900/60 overflow-hidden opacity-70 hover:opacity-90 transition-all duration-300 scale-95">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-orange-50/50 dark:bg-orange-950/20 border-b border-orange-200/60 dark:border-orange-700/60">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800">
            <FlaskConical className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {typeName}
              </h3>
              <Badge
                variant="outline"
                className="border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 text-xs"
              >
                Идэвхгүй
              </Badge>
            </div>
            {standard && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Стандарт: {standard}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onReactivate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReactivate}
              className="gap-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Идэвхжүүлэх
            </Button>
          )}
          <Badge
            variant="secondary"
            className="font-medium bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800 px-2 py-0.5 text-xs"
          >
            {items.length} шинжилгээ
          </Badge>
        </div>
      </div>

      {/* Compact view - just show message if no indicators */}
      {items.length === 0 && (
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-600">
            Шинжилгээ байхгүй
          </p>
        </div>
      )}
    </div>
  );
}
