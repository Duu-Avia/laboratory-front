"use client";

import { useEffect, useMemo, useState } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage, logError } from "@/lib/errors";
import type { Employee, LabType } from "@/types";

export type GroupMap = Map<number, Employee[]>;

function buildGroups(employees: Employee[], labTypes: LabType[]): GroupMap {
  const map: GroupMap = new Map();
  for (const lt of labTypes) {
    map.set(lt.id, []);
  }
  map.set(0, []);

  for (const emp of employees) {
    if (emp.lab_types && emp.lab_types.length > 0) {
      for (const lt of emp.lab_types) {
        const list = map.get(lt.id);
        if (list) {
          if (!list.find((e) => e.id === emp.id)) {
            list.push(emp);
          }
        }
      }
    } else {
      map.get(0)!.push(emp);
    }
  }
  return map;
}

export function useEmployeeReassign(
  open: boolean,
  employees: Employee[],
  labTypes: LabType[],
  onSaved?: () => void,
  onClose?: () => void
) {
  const [groups, setGroups] = useState<GroupMap>(() =>
    buildGroups(employees, labTypes)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changes, setChanges] = useState<Map<number, Set<number>>>(new Map());
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  useEffect(() => {
    if (!open) return;
    setGroups(buildGroups(employees, labTypes));
    setChanges(new Map());
    setError(null);
    setSelectedEmp(null);
  }, [open, employees, labTypes]);

  const allLabTypes = useMemo(() => {
    return [
      ...labTypes,
      { id: 0, type_name: "Хуваарилагдаагүй", standard: "" },
    ];
  }, [labTypes]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceGroupId = Number(source.droppableId);
    const destGroupId = Number(destination.droppableId);
    const empId = Number(draggableId);

    setGroups((prev) => {
      const next = new Map(prev);
      const sourceList = [...(next.get(sourceGroupId) ?? [])];
      const empIndex = sourceList.findIndex((e) => e.id === empId);
      if (empIndex === -1) return prev;
      const [employee] = sourceList.splice(empIndex, 1);
      next.set(sourceGroupId, sourceList);

      const destList = [...(next.get(destGroupId) ?? [])];
      if (!destList.find((e) => e.id === empId)) {
        destList.splice(destination.index, 0, employee);
      }
      next.set(destGroupId, destList);
      return next;
    });

    setChanges((prev) => {
      const next = new Map(prev);
      if (!next.has(empId)) {
        const emp = employees.find((e) => e.id === empId);
        const originalIds = new Set<number>(
          emp?.lab_types?.map((lt) => lt.id) ?? [0]
        );
        next.set(empId, originalIds);
      }
      const currentSet = new Set(next.get(empId)!);
      if (sourceGroupId !== 0) currentSet.delete(sourceGroupId);
      if (destGroupId !== 0) currentSet.add(destGroupId);
      if (currentSet.size === 0) currentSet.add(0);
      next.set(empId, currentSet);
      return next;
    });
  };

  const handleSave = async () => {
    if (changes.size === 0) {
      onClose?.();
      return;
    }

    try {
      setError(null);
      setSaving(true);

      const promises = Array.from(changes.entries()).map(
        ([userId, labTypeIds]) => {
          const ids = Array.from(labTypeIds).filter((id) => id !== 0);
          return api.post(ENDPOINTS.USERS.ASSIGN_LAB_TYPES(userId), {
            lab_type_ids: ids,
          });
        }
      );

      const results = await Promise.allSettled(promises);
      const failures = results.filter((r) => r.status === "rejected");

      if (failures.length > 0) {
        setError(`${failures.length} ажилтны өөрчлөлт хадгалагдсангүй`);
      } else {
        onSaved?.();
        onClose?.();
      }
    } catch (err) {
      logError(err, "Reassign lab types");
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return {
    groups,
    allLabTypes,
    changes,
    saving,
    error,
    selectedEmp,
    setSelectedEmp,
    handleDragEnd,
    handleSave,
  };
}
