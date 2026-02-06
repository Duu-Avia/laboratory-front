import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Package, MapPin } from "lucide-react";
import { LabType } from "@/types";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError, getErrorMessage } from "@/lib/errors";
import {
  locationPackageValidation,
  LocationPackageForm,
} from "@/lib/validators";

interface CreateLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labTypes: LabType[];
  onCreated: () => void;
}

export function CreateLocationDialog({
  open,
  onOpenChange,
  labTypes,
  onCreated,
}: CreateLocationDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LocationPackageForm>({
    resolver: zodResolver(locationPackageValidation),
    defaultValues: {
      package_name: "",
      lab_type_id: 0,
    },
  });

  const labTypeId = watch("lab_type_id");

  const onSubmit = async (data: LocationPackageForm) => {
    try {
      setServerError(null);
      await api.post(ENDPOINTS.LOCATIONS.CREATE, {
        package_name: data.package_name.trim(),
        lab_type_id: data.lab_type_id,
      });
      onCreated();
      onOpenChange(false);
      reset();
    } catch (err) {
      logError(err, "Create location package");
      setServerError(getErrorMessage(err));
    }
  };

  // Filter only active lab types
  const activeLabTypes = labTypes.filter(
    (lt) =>
      lt.is_active === 1 || lt.is_active === true || lt.is_active === undefined
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          reset();
          setServerError(null);
        }
      }}
    >
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
              <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Шинэ багц нэмэх
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-5">
          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
              {serverError}
            </div>
          )}

          {/* Lab Type Selection */}
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Сорьцын төрөл
            </Label>
            <Select
              value={labTypeId ? String(labTypeId) : ""}
              onValueChange={(v) => setValue("lab_type_id", Number(v))}
            >
              <SelectTrigger className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
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
            {errors.lab_type_id && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.lab_type_id.message}
              </p>
            )}
          </div>

          {/* Package Name */}
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Багцын нэр
            </Label>
            <Input
              {...register("package_name")}
              placeholder="жишээ: Ундны ус 5 цэг"
              className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            {errors.package_name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.package_name.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-5 border-t border-slate-200/60 dark:border-slate-800/60 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Болих
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Package className="h-4 w-4" />
              Хадгалах
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
