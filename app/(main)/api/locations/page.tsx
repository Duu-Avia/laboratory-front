"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationPackage, LabType } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError } from "@/lib/errors";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import {
  CreateLocationDialog,
  DeleteLocationDialog,
  ManageSamplesDialog,
} from "./_components/dialogs";
import { LocationCard } from "./_components/LocationCard";
import { Search } from "lucide-react";

const ELEVATED_ROLES = ["senior_engineer", "admin", "superadmin"];

export default function LocationsPage() {
  const router = useRouter();
  const { getUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Role-based access control
  useEffect(() => {
    const user = getUser();
    const userRole = user?.roleName ?? "";

    if (!ELEVATED_ROLES.includes(userRole)) {
      router.push("/");
    } else {
      setIsAuthorized(true);
    }
  }, [getUser, router]);

  // Data
  const [locations, setLocations] = useState<LocationPackage[]>([]);
  const [labTypes, setLabTypes] = useState<LabType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [manageSamplesOpen, setManageSamplesOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationPackage | null>(null);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [locationsData, labTypesData] = await Promise.all([
          api.get<LocationPackage[]>(ENDPOINTS.LOCATIONS.ALL_WITH_SAMPLES),
          api.get<LabType[]>(ENDPOINTS.LAB_TYPES.LIST),
        ]);
        setLocations(locationsData);
        setLabTypes(labTypesData);
      } catch (err) {
        logError(err, "Fetch initial data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchLocations = () => {
    api
      .get<LocationPackage[]>(ENDPOINTS.LOCATIONS.ALL_WITH_SAMPLES)
      .then((data) => setLocations(data))
      .catch((err) => {
        logError(err, "Fetch locations");
        console.error("Error fetching locations:", err);
      });
  };

  // Filter locations by search
  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locations;

    return locations.filter((loc) => {
      const labType = labTypes.find((lt) => lt.id === loc.lab_type_id);
      return (
        loc.package_name.toLowerCase().includes(q) ||
        labType?.type_name.toLowerCase().includes(q)
      );
    });
  }, [locations, labTypes, search]);

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
            {/* Header */}
            <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900">
              <div className="mx-auto max-w-7xl px-2 py-10">
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
                        <MapPin className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                          Байршлын багц
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Сорьцын төрөл бүрт харгалзах байршлын багц удирдах
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setCreateOpen(true)}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200"
                    size="lg"
                  >
                    <MapPin className="h-4 w-4" />
                    Шинэ багц нэмэх
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-2 py-8 space-y-6">
              {/* Search */}
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 p-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                    Хайлт
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Багцын нэр, Сорьцын төрөл..."
                      className="pl-10 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Нийт багц:{" "}
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {filteredLocations.length}
                    </span>
                  </span>
                </div>
              </div>

              {/* Location Cards */}
              {filteredLocations.length === 0 ? (
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-12 text-center">
                  <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">
                    {search
                      ? "Хайлтын үр дүн олдсонгүй"
                      : "Байршлын багц одоогоор байхгүй байна"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLocations.map((location) => {
                    const labType = labTypes.find(
                      (lt) => lt.id === location.lab_type_id
                    );
                    return (
                      <LocationCard
                        key={location.id}
                        location={location}
                        labTypeName={labType?.type_name ?? "Тодорхойгүй"}
                        onManageSamples={() => {
                          setSelectedLocation(location);
                          setManageSamplesOpen(true);
                        }}
                        onDelete={() => {
                          setSelectedLocation(location);
                          setDeleteOpen(true);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dialogs */}
            <CreateLocationDialog
              open={createOpen}
              onOpenChange={setCreateOpen}
              labTypes={labTypes}
              onCreated={fetchLocations}
            />

            <DeleteLocationDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              location={selectedLocation}
              onDeleted={fetchLocations}
            />

            <ManageSamplesDialog
              open={manageSamplesOpen}
              onOpenChange={setManageSamplesOpen}
              location={selectedLocation}
              onUpdated={fetchLocations}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
