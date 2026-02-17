"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Users,
  Settings2,
  Loader2,
  FlaskConical,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError } from "@/lib/errors";
import { useUser } from "@/lib/hooks/useUser";
import type { Employee, LabType } from "@/types";
import { LabTypeGroup } from "./_components/LabTypeGroup";
import { CreateEmployeeDialog } from "./_components/CreateEmployeeDialog";
import { StatCard } from "./_components/Statcard";
import { Roles } from "@/types/user";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

const CAN_CREATE_ROLES = ["admin", "senior_engineer", "superadmin"] as const;

const ReassignDialog = dynamic(
  () =>
    import("./_components/ReassignDialog").then((mod) => mod.ReassignDialog),
  { ssr: false }
);

export default function EmployeesPage() {
  const { user } = useUser();

  const [mounted, setMounted] = useState(false);
  const [roleId, setRoleId] = useState<Roles[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [labTypes, setLabTypes] = useState<LabType[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaultLabType, setCreateDefaultLabType] = useState<
    number | undefined
  >();

  const [reassignOpen, setReassignOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const canCreate = CAN_CREATE_ROLES.includes((user?.role ?? "") as any);
  const isSuperAdmin = user?.role === "superadmin";

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get<Employee[]>(ENDPOINTS.USERS.LIST),
      api.get<LabType[]>(ENDPOINTS.LAB_TYPES.LIST),
    ])
      .then(([users, types]) => {
        setEmployees(users);
        setLabTypes(types);
      })
      .catch((err) => {
        logError(err, "Fetch employees");
      })
      .finally(() => setLoading(false));
  };
  const fetchRoleId = async () => {
    try {
      const data = await api.get<Roles[]>(ENDPOINTS.USERS.ROLES);
      setRoleId(data);
    } catch (err) {
      logError(err, "Fetch user role");
    }
  };

  useEffect(() => {
    fetchData();
    fetchRoleId();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<number, Employee[]>();
    for (const lt of labTypes) map.set(lt.id, []);
    for (const emp of employees) {
      if (emp.lab_types?.length) {
        for (const lt of emp.lab_types) {
          map.get(lt.id)?.push(emp);
        }
      }
    }
    return map;
  }, [employees, labTypes]);

  const unassigned = useMemo(() => {
    return employees.filter(
      (emp) => !emp.lab_types || emp.lab_types.length === 0
    );
  }, [employees]);
  const stats = {
    total: employees.length,
    labs: labTypes.length,
    assigned: employees.length - unassigned.length,
    unassigned: unassigned.length - 1,
    assignedPercent:
      employees.length > 0
        ? Math.round(
            ((employees.length + 1 - unassigned.length) / employees.length) *
              100
          )
        : 0,
  };
  const handleCreateInGroup = (labTypeId: number) => {
    setCreateDefaultLabType(labTypeId);
    setCreateOpen(true);
  };
  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm font-medium">Уншиж байна...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
      <div className="mx-auto max-w-8xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Engineering Teams
            </h1>
            <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Users className="h-4 w-4 text-slate-400" />
              Нийт {employees.length} ажилтан бүртгэлтэй
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setReassignOpen(true)}
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Засвар оруулах</span>
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center h-[60vh]"
            >
              <motion.div
                animate={{
                  scale: [1, 2, 2, 1, 1],
                  rotate: [0, 0, 180, 180, 0],
                  borderRadius: ["0%", "0%", "50%", "50%", "0%"],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.5, 0.8, 1],
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="w-12 h-12 bg-[#D1B23F]"
                style={{ borderRadius: 5 }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Нийт ажилтан"
                  value={stats.total}
                  icon={Users}
                  colorClass="bg-sky-50 text-sky-500"
                />
                <StatCard
                  title="Лаборатори"
                  value={stats.labs}
                  icon={FlaskConical}
                  colorClass="bg-teal-50 text-teal-500"
                />
                <StatCard
                  title="Хуваарилагдсан"
                  value={stats.assigned}
                  subtext={`${stats.assignedPercent}%`}
                  icon={UserCheck}
                  colorClass="bg-indigo-50 text-indigo-500"
                />
                <StatCard
                  title="Хуваарилагдаагүй"
                  value={stats.unassigned}
                  icon={UserX}
                  colorClass="bg-slate-100 text-slate-500"
                />
              </div>

              {/* Lab Groups */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 items-start">
                {labTypes.map((lt) => (
                  <LabTypeGroup
                    key={lt.id}
                    labType={lt}
                    employees={grouped.get(lt.id) ?? []}
                    canCreate={canCreate}
                    onCreateClick={() => handleCreateInGroup(lt.id)}
                  />
                ))}

                {unassigned.length > 0 && (
                  <LabTypeGroup
                    labType={{
                      id: 0,
                      type_name: "Хуваарилагдаагүй",
                      standard: "",
                    }}
                    employees={unassigned}
                    canCreate={false}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CreateEmployeeDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          labTypes={labTypes}
          roles={roleId}
          defaultLabTypeId={createDefaultLabType}
          isSuperAdmin={isSuperAdmin}
          onCreated={fetchData}
        />

        {isSuperAdmin && (
          <ReassignDialog
            open={reassignOpen}
            onOpenChange={setReassignOpen}
            employees={employees}
            labTypes={labTypes}
            onSaved={fetchData}
          />
        )}
      </div>
    </div>
  );
}
