"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Employee } from "@/types";

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  superadmin: "Super Admin",
  senior_engineer: "Senior Eng",
  engineer: "Engineer",
  user: "User",
};

export const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  superadmin: "bg-pink-100 text-pink-700",
  senior_engineer: "bg-indigo-100 text-indigo-700",
  engineer: "bg-slate-100 text-slate-600",
  user: "bg-gray-100 text-gray-500",
};

function getInitials(email: string): string {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Generate a consistent pastel color based on string
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 90%)`;
}

function stringToTextColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 35%)`;
}

interface EmployeeCardProps {
  employee: Employee;
  compact?: boolean;
  onEdit?: (employee: Employee) => void;
  key?: string | number | null | undefined;
}

export function EmployeeCard({ employee, compact, onEdit }: EmployeeCardProps) {
  const initials = getInitials(employee.email);
  const displayName = employee.email.split("@")[0].replace(/[._-]/g, " ");
  const roleLabel = ROLE_LABELS[employee.role_name] ?? employee.role_name;
  
  const bgColor = stringToColor(employee.email);
  const textColor = stringToTextColor(employee.email);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-100 text-sm shadow-sm">
        <div 
          className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {initials}
        </div>
        <span className="truncate capitalize font-medium text-slate-700">{displayName}</span>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 ${onEdit ? "cursor-pointer" : ""}`}
      onClick={onEdit ? () => onEdit(employee) : undefined}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div 
          className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {initials}
        </div>
        {/* Active Status Dot */}
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
          employee.is_active ? "bg-emerald-500" : "bg-slate-300"
        )} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-800 capitalize truncate leading-none">
            {displayName}
          </span>
          {/* Mobile-friendly role badge */}
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0",
            ROLE_COLORS[employee.role_name] || "bg-slate-100 text-slate-600"
          )}>
            {roleLabel}
          </span>
        </div>
        <span className="text-xs text-slate-400 truncate mt-1 font-medium">
          {employee.email}
        </span>
      </div>

      {!employee.is_active && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded shadow-sm border">Inactive</span>
        </div>
      )}
    </div>
  );
}