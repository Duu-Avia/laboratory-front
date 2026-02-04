"use client";

import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Employee, LabType } from "@/types";
import { EmployeeCard } from "./EmployeeCard";

interface LabTypeGroupProps {
  labType: LabType;
  employees: Employee[];
  canCreate: boolean;
  onCreateClick?: () => void;
  onEmployeeEdit?: (employee: Employee) => void;
  key?: string | number | null | undefined;
}

export function LabTypeGroup({
  labType,
  employees,
  canCreate,
  onCreateClick,
  onEmployeeEdit,
}: LabTypeGroupProps) {
  const isEmpty = employees.length === 0;
  console.log(employees, "from lab type group");
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md h-full">
      {/* Card Header */}
      <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50 px-5 py-4">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-800 text-base leading-tight">
            {labType.type_name}
          </h3>
          {labType.standard ? (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {labType.standard}
            </p>
          ) : (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              General Lab
            </p>
          )}
        </div>
        <Badge
          variant="secondary"
          className={`px-2.5 py-0.5 text-xs font-semibold ${
            isEmpty
              ? "bg-slate-100 text-slate-500"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
        >
          {employees.length}
        </Badge>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-2">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 rounded-full bg-slate-50 p-3">
              <Users className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-xs font-medium text-slate-400">
              Одоогоор инженер байхгүй
            </p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {employees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onEdit={onEmployeeEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Footer */}
      {canCreate && (
        <div className="border-t border-slate-50 bg-slate-50/50 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all border border-transparent hover:border-slate-100 h-9"
            onClick={onCreateClick}
          >
            <Plus className="h-3.5 w-3.5" />
            Инженер нэмэх
          </Button>
        </div>
      )}
    </div>
  );
}
