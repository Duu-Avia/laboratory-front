"use client";

import { useState } from "react";
import { IndicatorRowForLabSpec, LabType } from "@/types";
import { ActiveLabTypeCard, InactiveLabTypeCard } from "./LabTypeCard";
import { FlaskConical, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GroupedIndicatorsSectionProps {
  grouped: Map<number, IndicatorRowForLabSpec[]>;
  labTypes: LabType[];
  filteredIndicatorsCount: number;
  selectedFilter?: string;
  onReactivateClick?: (labType: LabType) => void;
  onEditClick?: (labType: LabType) => void;
  onDeleteClick?: (labType: LabType) => void;
  onEditIndicator?: (indicator: IndicatorRowForLabSpec) => void;
  onDeleteIndicator?: (indicator: IndicatorRowForLabSpec) => void;
}

export function GroupedIndicatorsSection({
  grouped,
  labTypes,
  filteredIndicatorsCount,
  selectedFilter = "all",
  onReactivateClick,
  onEditClick,
  onDeleteClick,
  onEditIndicator,
  onDeleteIndicator,
}: GroupedIndicatorsSectionProps) {
  const [inactiveExpanded, setInactiveExpanded] = useState(false);

  // Separate active and inactive lab types
  // Active lab types:
  // - If "all" filter: show ALL active lab types (even without indicators, so users can edit/delete)
  // - If specific filter: only show lab types that have indicators (respect the filter)
  const activeLabTypes = labTypes
    .filter(
      (lt) =>
        lt.is_active === 1 ||
        lt.is_active === true ||
        lt.is_active === undefined
    )
    .filter((lt) => selectedFilter === "all" || grouped.has(lt.id));

  // Inactive lab types: show ALL inactive lab types regardless of filter
  const inactiveLabTypes = labTypes.filter(
    (lt) => lt.is_active === 0 || lt.is_active === false
  );

  return (
    <div className="space-y-5">
      {/* Active Lab Types */}
      {activeLabTypes.map((labType) => {
        const items = grouped.get(labType.id) || [];
        return (
          <ActiveLabTypeCard
            key={labType.id}
            typeName={labType.type_name}
            standard={labType.standard}
            items={items}
            onEdit={() => onEditClick?.(labType)}
            onDelete={() => onDeleteClick?.(labType)}
            onEditIndicator={onEditIndicator}
            onDeleteIndicator={onDeleteIndicator}
          />
        );
      })}

      {/* Inactive Lab Types - Collapsible Section */}
      {inactiveLabTypes.length > 0 && (
        <div className="rounded-2xl  border border-red-200/60 dark:border-orange-800/60 bg-red-50/30 dark:bg-orange-950/20 overflow-hidden transition-all duration-300">
          {/* Header - Clickable to expand/collapse */}
          <button
            onClick={() => setInactiveExpanded(!inactiveExpanded)}
            className="w-full flex items-center justify-between gap-4 px-6 py-2 bg-gray-50 dark:bg-red-950/30 border-b border-red-200/60 dark:border-red-800/60 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-orange-900">
                <FlaskConical className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-bold text-gray-500 dark:text-white text-sm">
                Идэвхгүй болгосон лабууд
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="font-medium bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800 px-3 py-1"
              >
                {inactiveLabTypes.length}
              </Badge>
              {inactiveExpanded ? (
                <ChevronUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              )}
            </div>
          </button>

          {/* Expandable Content */}
          {inactiveExpanded && (
            <div className="p-4 space-y-3 animate-fade-in">
              {inactiveLabTypes.map((labType) => {
                const items = grouped.get(labType.id) || [];
                return (
                  <InactiveLabTypeCard
                    key={labType.id}
                    typeName={labType.type_name}
                    standard={labType.standard}
                    items={items}
                    onReactivate={() => onReactivateClick?.(labType)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {labTypes.length === 0 && (
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl py-20 text-center">
          <FlaskConical className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700 mb-6" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Лаб төрөл байхгүй байна
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            "Лаб төрөл нэмэх" товчийг дарж шинэ төрөл нэмнэ үү
          </p>
        </div>
      )}
    </div>
  );
}
