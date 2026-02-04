"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  ArrowRightLeft,
  AlertCircle,
  Save,
  Loader2,
  GripVertical,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Employee, LabType } from "@/types";
import { EmployeeCard } from "./EmployeeCard";
import { EditPanel } from "./EditPanel";
import { useEmployeeReassign } from "@/lib/hooks/useEmployeeReassign";

interface ReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  labTypes: LabType[];
  onSaved?: () => void;
}

function DraggableInPortal({
  provided,
  snapshot,
  children,
}: {
  provided: any;
  snapshot: any;
  children: React.ReactNode;
}) {
  const child = (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        ...provided.draggableProps.style,
        width: snapshot.isDragging ? 280 : undefined,
        zIndex: 9999,
        cursor: "grabbing",
      }}
    >
      {children}
    </div>
  );

  if (snapshot.isDragging) {
    return createPortal(child, document.body);
  }

  return child;
}

export function ReassignDialog({
  open,
  onOpenChange,
  employees,
  labTypes,
  onSaved,
}: ReassignDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    groups,
    allLabTypes,
    changes,
    saving,
    error,
    selectedEmp,
    setSelectedEmp,
    handleDragEnd,
    handleSave,
  } = useEmployeeReassign(open, employees, labTypes, onSaved, () =>
    onOpenChange(false)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 w-[95vw] max-w-[95vw] sm:max-w-[1600px] h-[90vh] bg-slate-50 sm:rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Засвар оруулах
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Чирж шилжүүлэх, ажилтан дээр дарж мэдээлэл засах
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Error Banner */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2 text-red-700 text-sm font-medium shrink-0">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Main Content: DnD columns + Edit panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Drag-and-drop columns */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-5 sm:p-6">
            {mounted && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start pb-4">
                  {allLabTypes.map((lt) => {
                    const groupEmployees = groups.get(lt.id) ?? [];
                    if (lt.id === 0 && groupEmployees.length === 0) return null;

                    return (
                      <div
                        key={lt.id}
                        className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ring-1 ring-slate-900/5"
                      >
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                          <h3 className="font-semibold text-sm text-slate-800 truncate max-w-[70%]">
                            {lt.type_name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="bg-white border-slate-200 text-slate-600 text-[10px] font-bold shadow-sm"
                          >
                            {groupEmployees.length}
                          </Badge>
                        </div>

                        <Droppable droppableId={String(lt.id)}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`
                                p-2 space-y-2 min-h-[120px]
                                transition-colors duration-200
                                ${snapshot.isDraggingOver ? "bg-blue-50/60" : "bg-white"}
                              `}
                            >
                              {groupEmployees.map((emp, index) => (
                                <Draggable
                                  key={emp.id}
                                  draggableId={String(emp.id)}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <DraggableInPortal
                                      provided={provided}
                                      snapshot={snapshot}
                                    >
                                      <div
                                        onClick={() =>
                                          !snapshot.isDragging &&
                                          setSelectedEmp(emp)
                                        }
                                        className={`
                                          group relative rounded-lg cursor-pointer
                                          transform transition-all
                                          ${snapshot.isDragging ? "rotate-2 scale-105 shadow-xl ring-2 ring-blue-500/20 z-50" : "hover:translate-y-[-2px] hover:shadow-md hover:z-10"}
                                          ${selectedEmp?.id === emp.id ? "ring-2 ring-blue-500" : ""}
                                        `}
                                      >
                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 pointer-events-none">
                                          <GripVertical className="h-3 w-3" />
                                        </div>
                                        <div className="group-hover:pl-1 transition-all">
                                          <EmployeeCard
                                            employee={emp}
                                            compact
                                          />
                                        </div>
                                      </div>
                                    </DraggableInPortal>
                                  )}
                                </Draggable>
                              ))}

                              {provided.placeholder}

                              {groupEmployees.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 rounded-lg border-2 border-dashed border-slate-100 mx-1">
                                  <Users className="h-5 w-5 text-slate-200 mb-1" />
                                  <span className="text-xs text-slate-400 font-medium">
                                    Хоосон
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </DragDropContext>
            )}
          </div>

          {/* Right: Edit panel */}
          <EditPanel
            employee={selectedEmp}
            onClose={() => setSelectedEmp(null)}
            onSaved={onSaved}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-white border-t border-slate-200 shrink-0 flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium w-full sm:w-auto justify-center sm:justify-start">
            {changes.size > 0 ? (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-100">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-200/50 text-xs font-bold">
                  {changes.size}
                </span>
                <span className="text-xs">өөрчлөлт хийгдсэн</span>
              </div>
            ) : (
              <span className="opacity-50 text-xs">Өөрчлөлт хийгдээгүй</span>
            )}
          </div>

          <div className="flex w-full sm:w-auto gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="flex-1 sm:flex-none hover:bg-slate-100 text-slate-600"
            >
              Болих
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || changes.size === 0}
              className={`
                flex-1 sm:flex-none gap-2 shadow-sm transition-all
                ${
                  changes.size > 0
                    ? "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }
              `}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Хадгалж байна...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Хадгалах
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
