import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Check, Loader2 } from "lucide-react";
import { LocationPackage, LabType } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError, getErrorMessage } from "@/lib/errors";

interface EditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: LocationPackage | null;
  labTypes: LabType[];
  onUpdated: () => void;
}

export function EditLocationDialog({
  open,
  onOpenChange,
  location,
  labTypes,
  onUpdated,
}: EditLocationDialogProps) {
  // Package name state
  const [packageName, setPackageName] = useState("");
  const [packageNameSaving, setPackageNameSaving] = useState(false);
  const [packageNameError, setPackageNameError] = useState<string | null>(null);
  const [packageNameSuccess, setPackageNameSuccess] = useState(false);

  // Lab type state
  const [labTypeId, setLabTypeId] = useState<number>(0);
  const [labTypeSaving, setLabTypeSaving] = useState(false);
  const [labTypeError, setLabTypeError] = useState<string | null>(null);
  const [labTypeSuccess, setLabTypeSuccess] = useState(false);

  // Load location data when dialog opens
  useEffect(() => {
    if (open && location) {
      setPackageName(location.package_name);
      setLabTypeId(location.lab_type_id);
      // Reset states
      setPackageNameError(null);
      setPackageNameSuccess(false);
      setLabTypeError(null);
      setLabTypeSuccess(false);
    }
  }, [open, location]);

  // Save package name
  const handlePackageNameSave = async () => {
    if (!location) return;
    if (!packageName.trim()) {
      setPackageNameError("Багцын нэр хоосон байна");
      return;
    }

    try {
      setPackageNameError(null);
      setPackageNameSuccess(false);
      setPackageNameSaving(true);
      await api.put(ENDPOINTS.LOCATIONS.DETAIL(location.id), {
        package_name: packageName.trim(),
      });
      setPackageNameSuccess(true);
      onUpdated();
      setTimeout(() => setPackageNameSuccess(false), 2000);
    } catch (err) {
      logError(err, "Update package name");
      setPackageNameError(getErrorMessage(err));
    } finally {
      setPackageNameSaving(false);
    }
  };

  // Save lab type
  const handleLabTypeSave = async () => {
    if (!location) return;
    if (!labTypeId) {
      setLabTypeError("Төрөл сонгоно уу");
      return;
    }

    try {
      setLabTypeError(null);
      setLabTypeSuccess(false);
      setLabTypeSaving(true);
      await api.put(ENDPOINTS.LOCATIONS.DETAIL(location.id), {
        lab_type_id: labTypeId,
      });
      setLabTypeSuccess(true);
      onUpdated();
      setTimeout(() => setLabTypeSuccess(false), 2000);
    } catch (err) {
      logError(err, "Update lab type");
      setLabTypeError(getErrorMessage(err));
    } finally {
      setLabTypeSaving(false);
    }
  };

  // Filter only active lab types
  const activeLabTypes = labTypes.filter(
    (lt) =>
      lt.is_active === 1 || lt.is_active === true || lt.is_active === undefined
  );

  const packageNameChanged =
    location && packageName.trim() !== location.package_name;
  const labTypeChanged = location && labTypeId !== location.lab_type_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
              <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Багц засах
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-5">
          {/* Lab Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Сорьцын төрөл
            </Label>
            <div className="flex gap-2">
              <Select
                value={labTypeId ? String(labTypeId) : ""}
                onValueChange={(v) => {
                  setLabTypeId(Number(v));
                  setLabTypeSuccess(false);
                  setLabTypeError(null);
                }}
              >
                <SelectTrigger className="flex-1 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                  <SelectValue placeholder="Төрөл сонгох" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  {activeLabTypes.map((lt) => (
                    <SelectItem key={lt.id} value={String(lt.id)}>
                      {lt.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleLabTypeSave}
                disabled={!labTypeChanged || labTypeSaving}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                {labTypeSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : labTypeSuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  "Хадгалах"
                )}
              </Button>
            </div>
            {labTypeError && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-medium">
                {labTypeError}
              </div>
            )}
            {labTypeSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 p-3 text-sm font-medium">
                Амжилттай хадгалагдлаа
              </div>
            )}
          </div>

          {/* Package Name */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Багцын нэр
            </Label>
            <div className="flex gap-2">
              <Input
                value={packageName}
                onChange={(e) => {
                  setPackageName(e.target.value);
                  setPackageNameSuccess(false);
                  setPackageNameError(null);
                }}
                placeholder="Багцын нэр"
                className="flex-1 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <Button
                onClick={handlePackageNameSave}
                disabled={!packageNameChanged || packageNameSaving}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                {packageNameSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : packageNameSuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  "Хадгалах"
                )}
              </Button>
            </div>
            {packageNameError && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-medium">
                {packageNameError}
              </div>
            )}
            {packageNameSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 p-3 text-sm font-medium">
                Амжилттай хадгалагдлаа
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
