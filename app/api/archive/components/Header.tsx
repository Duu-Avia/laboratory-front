import { ArchiveFilterBarProps } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Download,
  Plus,
  Search,
  Filter,
  XCircle,
  CheckCircle2,
  Icon,
} from "lucide-react";

type ArchiveStatus = "all" | "deleted" | "approved";

const statusOptions: {
  key: ArchiveStatus;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    key: "approved",
    label: "Батлагдсан",
    icon: CheckCircle2,
    color:
      "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 ring-emerald-500/20",
  },
  {
    key: "deleted",
    label: "Устгагдсан",
    icon: XCircle,
    color:
      "text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100 ring-rose-500/20",
  },
];

export function ArchiveHeader({
  from,
  to,
  search,
  selectedSampleType,
  status,
  sampleTypes,
  onFromChange,
  onToChange,
  onSearchChange,
  onSampleTypeChange,
  onStatusChange,
  onExportClick,
}: ArchiveFilterBarProps) {
  return (
    <div className="space-y-6">
      {/* Top Section - Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Тайлангийн архив
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Бүх тайлангуудыг хайх, шүүх, экспортлох
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onExportClick}
            className="h-10 px-4 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <Download className="w-4 h-4 mr-2" />
            Экселрүү хөрвүүлэх
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">
        {/* Date & Search Row */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              Эхлэх он
            </Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              className="w-[160px] h-10 border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-lg text-sm transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              Дуусах он
            </Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              className="w-[160px] h-10 border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-lg text-sm transition-colors"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-[280px]">
            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Search className="w-3 h-3" />
              Түлхүүр үгээр хайх
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Тайлангийн нэрээр хайх..."
                className="pl-10 w-[50%] h-10 border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-lg text-sm transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Filter Buttons Row */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          {/* Sample Type Filters */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
              <Filter className="w-3 h-3" />
              Лаб төрөлөөр хайх
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onSampleTypeChange("all")}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    selectedSampleType === "all"
                      ? "bg-slate-800 text-white shadow-lg shadow-slate-800/25"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                  }
                `}
              >
                Бүгд
              </button>
              {sampleTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onSampleTypeChange(type.type_name)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${
                      selectedSampleType === type.type_name
                        ? "bg-slate-800 text-white shadow-lg shadow-slate-800/25"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                    }
                  `}
                >
                  {type.type_name}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="space-y-2.5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide text-right">
              Тайлангийн төлөвөөр хайх
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {statusOptions.map((s) => {
                const active = status === s.key;
                const Icon = s.icon;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => onStatusChange(s.key)}
                    className={`
                      flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${
                        active
                          ? s.color + " ring-2 shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
