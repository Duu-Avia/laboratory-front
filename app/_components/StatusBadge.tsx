import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";

const STATUS_STYLES: Record<string, { className: string; dotColor: string }> = {
  draft: {
    className: "bg-slate-50 text-slate-700  hover:bg-slate-100",
    dotColor: "bg-slate-500",
  },
  pending_samples: {
    className: " text-amber-700  hover:bg-amber-50 ",
    dotColor: "bg-amber-200",
  },
  tested: {
    className: "text-cyan-700 hover:bg-cyan-50 ",
    dotColor: "bg-cyan-200",
  },
  signed: {
    className: "text-gray-700 hover:bg-violet-50",
    dotColor: "bg-green-200",
  },
  approved: {
    className: "bg-emerald-50 text-emerald-700  hover:bg-emerald-100 ",
    dotColor: "bg-emerald-200",
  },
  deleted: {
    className: "bg-rose-50 text-rose-700  hover:bg-rose-",
    dotColor: "bg-rose-200",
  },
};

const DEFAULT_STYLE = {
  className: "bg-slate-100 text-slate-600 ",
  dotColor: "bg-slate-400",
};

export function StatusBadge({ status, label: labelOverride }: { status: string; label?: string }) {
  const style = STATUS_STYLES[status] || DEFAULT_STYLE;
  const label = labelOverride || STATUS_LABELS[status] || status;

  return (
    <Badge
      variant="outline"
      className={`font-medium px-3 py-1 rounded-full text-xs flex items-center gap-2 transition-colors ${style.className}`}
    >
      <span className={`w-2 h-2 rounded-full ${style.dotColor}`} />
      {label}
    </Badge>
  );
}
