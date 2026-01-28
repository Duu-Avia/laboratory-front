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
        "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "bg-primary text-primary-foreground shadow-soft"
          : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
      )}
    >
      {label}
    </button>
  );
}
