import { Input } from "@/components/ui/input";
import { Search, FlaskConical } from "lucide-react";
import { FilterPill } from "./FilterPill";

interface FilterSectionProps {
  typeButtons: Array<{ key: string; label: string }>;
  selectedType: string;
  onTypeChange: (type: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  filteredCount: number;
}

export function FilterSection({
  typeButtons,
  selectedType,
  onTypeChange,
  search,
  onSearchChange,
  filteredCount,
}: FilterSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Type Filter Pills */}
        <div className="space-y-3 flex-1">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-500" />
            Лаб төрлөөр шүүх
          </label>
          <div className="flex flex-wrap gap-2">
            {typeButtons.map((b) => (
              <FilterPill
                key={b.key}
                label={b.label}
                active={selectedType === b.key}
                onClick={() => onTypeChange(b.key)}
              />
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="w-full lg:w-96 space-y-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-500" />
            Хайлт
          </label>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="E.coli, ISO, mg/m3..."
              className="pl-10 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
          <FlaskConical className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Нийт шинжилгээ:{" "}
          <span className="font-bold text-slate-900 dark:text-white text-base">
            {filteredCount}
          </span>
        </span>
      </div>
    </div>
  );
}
