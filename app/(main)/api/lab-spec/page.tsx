"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";

import { HeaderSection } from "./_components/HeaderSection";
import { FilterSection } from "./_components/FilterSection";
import { GroupedIndicatorsSection } from "./_components/GroupedLabTypeCard";
import {
  CreateLabTypeDialog,
  EditLabTypeDialog,
  DeleteLabTypeDialog,
  ReactivateLabTypeDialog,
  EditIndicatorDialog,
  DeleteIndicatorDialog,
} from "./_components/dialogs";
import { IndicatorRowForLabSpec, LabType } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError } from "@/lib/errors";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";

const ELEVATED_ROLES = ["senior_engineer", "admin", "superadmin"];

export default function LabPage() {
  const router = useRouter();
  const { user } = useUser();
  const userRole = user?.role ?? "";
  const isAuthorized = ELEVATED_ROLES.includes(userRole);

  useEffect(() => {
    if (user && !isAuthorized) {
      router.push("/");
    }
  }, [user, isAuthorized, router]);

  // data (UI only, you will fetch)
  const [labTypes, setLabTypes] = useState<LabType[]>([]);
  const [indicators, setIndicators] = useState<IndicatorRowForLabSpec[]>([]);
  // filters
  const [selectedType, setSelectedType] = useState<string>("all");
  const [search, setSearch] = useState("");

  // lab type modals
  const [createLabTypeOpen, setCreateLabTypeOpen] = useState(false);
  const [editLabTypeOpen, setEditLabTypeOpen] = useState(false);
  const [deleteLabTypeOpen, setDeleteLabTypeOpen] = useState(false);
  const [reactivateLabTypeOpen, setReactivateLabTypeOpen] = useState(false);
  const [selectedLabType, setSelectedLabType] = useState<LabType | null>(null);
  const [loading, setLoading] = useState(true);

  // indicator modals
  const [editIndicatorOpen, setEditIndicatorOpen] = useState(false);
  const [deleteIndicatorOpen, setDeleteIndicatorOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] =
    useState<IndicatorRowForLabSpec | null>(null);

  const fetchLabTypes = () => {
    api
      .get<LabType[]>(ENDPOINTS.LAB_TYPES.LIST)
      .then((data) => {
        // Show all lab types (active and inactive)
        setLabTypes(data);
      })
      .catch((err) => logError(err, "Fetch lab types"));
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [labTypesData, indicatorsData] = await Promise.all([
          api.get<LabType[]>(ENDPOINTS.LAB_TYPES.LIST),
          api.get<IndicatorRowForLabSpec[]>(ENDPOINTS.INDICATORS.LIST),
        ]);
        setLabTypes(labTypesData);
        setIndicators(indicatorsData);
      } catch (err) {
        logError(err, "Fetch initial data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const typeButtons = useMemo(() => {
    // Only show active lab types in filter pills
    const activeLabTypes = labTypes.filter(
      (t) =>
        t.is_active === 1 || t.is_active === true || t.is_active === undefined
    );
    return [
      { key: "all", label: "Бүгд" },
      ...activeLabTypes.map((t) => ({
        key: String(t.id),
        label: t.type_name,
      })),
    ];
  }, [labTypes]);

  const filteredIndicators = useMemo(() => {
    const q = search.trim().toLowerCase();

    return indicators.filter((i) => {
      const matchType =
        selectedType === "all" ? true : i.lab_type_id === Number(selectedType);
      const matchSearch =
        !q ||
        i.indicator_name?.toLowerCase().includes(q) ||
        (i.test_method ?? "").toLowerCase().includes(q) ||
        (i.unit ?? "").toLowerCase().includes(q) ||
        (i.limit_value ?? "").toLowerCase().includes(q);

      return matchType && matchSearch;
    });
  }, [indicators, selectedType, search]);

  const grouped = useMemo(() => {
    const map = new Map<number, IndicatorRowForLabSpec[]>();
    for (const i of filteredIndicators) {
      if (!map.has(i.lab_type_id)) map.set(i.lab_type_id, []);
      map.get(i.lab_type_id)!.push(i);
    }
    return map;
  }, [filteredIndicators]);

  const fetchIndicators = () => {
    api
      .get<IndicatorRowForLabSpec[]>(ENDPOINTS.INDICATORS.LIST)
      .then((data) => setIndicators(data))
      .catch((err) => logError(err, "Fetch indicators"));
  };

  // Don't render content until authorization check completes
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center h-[80vh]"
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
            className="space-y-5"
          >
            {/* Hero Header */}
            <HeaderSection
              onCreateLabType={() => setCreateLabTypeOpen(true)}
              labTypes={labTypes}
              selectedLabTypeId={selectedType}
              onIndicatorCreated={fetchIndicators}
            />

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-2 py-8 space-y-6">
              {/* Filters Card */}
              <FilterSection
                typeButtons={typeButtons}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                search={search}
                onSearchChange={setSearch}
                filteredCount={filteredIndicators.length}
              />

              {/* Grouped Indicator Cards */}
              <GroupedIndicatorsSection
                grouped={grouped}
                labTypes={labTypes}
                filteredIndicatorsCount={filteredIndicators.length}
                selectedFilter={selectedType}
                onReactivateClick={(labType) => {
                  setSelectedLabType(labType);
                  setReactivateLabTypeOpen(true);
                }}
                onEditClick={(labType) => {
                  setSelectedLabType(labType);
                  setEditLabTypeOpen(true);
                }}
                onDeleteClick={(labType) => {
                  setSelectedLabType(labType);
                  setDeleteLabTypeOpen(true);
                }}
                onEditIndicator={(indicator) => {
                  setSelectedIndicator(indicator);
                  setEditIndicatorOpen(true);
                }}
                onDeleteIndicator={(indicator) => {
                  setSelectedIndicator(indicator);
                  setDeleteIndicatorOpen(true);
                }}
              />
            </div>

            {/* Lab Type Dialogs */}
            <CreateLabTypeDialog
              open={createLabTypeOpen}
              onOpenChange={setCreateLabTypeOpen}
              onCreated={fetchLabTypes}
            />

            <EditLabTypeDialog
              open={editLabTypeOpen}
              onOpenChange={setEditLabTypeOpen}
              labType={selectedLabType}
              onUpdated={fetchLabTypes}
            />

            <DeleteLabTypeDialog
              open={deleteLabTypeOpen}
              onOpenChange={setDeleteLabTypeOpen}
              labType={selectedLabType}
              indicatorCount={
                selectedLabType
                  ? indicators.filter(
                      (i) => i.lab_type_id === selectedLabType.id
                    ).length
                  : 0
              }
              onDeleted={fetchLabTypes}
            />

            <ReactivateLabTypeDialog
              open={reactivateLabTypeOpen}
              onOpenChange={setReactivateLabTypeOpen}
              labType={selectedLabType}
              onReactivated={fetchLabTypes}
            />

            {/* Indicator Dialogs */}
            <EditIndicatorDialog
              open={editIndicatorOpen}
              onOpenChange={setEditIndicatorOpen}
              indicator={selectedIndicator}
              onUpdated={fetchIndicators}
            />

            <DeleteIndicatorDialog
              open={deleteIndicatorOpen}
              onOpenChange={setDeleteIndicatorOpen}
              indicator={selectedIndicator}
              onDeleted={fetchIndicators}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
