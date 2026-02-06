import { cn } from "@/lib/utils";

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-200 border",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        active
          ? "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 ring-blue-500/20 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800 dark:hover:bg-blue-900/50"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
      )}
    >
      {label}
    </button>
  );
}
