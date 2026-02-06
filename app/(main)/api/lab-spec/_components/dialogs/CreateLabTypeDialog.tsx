"use client";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Beaker, FileText, Sparkles } from "lucide-react";

import { labTypeValidation, type LabTypeForm } from "@/lib/validators";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { logError, getErrorMessage } from "@/lib/errors";

interface CreateLabTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateLabTypeDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateLabTypeDialogProps) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LabTypeForm>({
    resolver: zodResolver(labTypeValidation),
    defaultValues: {
      type_name: "",
      standard: "",
    },
  });

  const onSubmit = async (data: LabTypeForm) => {
    try {
      setServerError("");
      await api.post(ENDPOINTS.LAB_TYPES.CREATE, {
        type_name: data.type_name.trim(),
        standard: data.standard.trim(),
      });
      reset();
      onCreated();
      onOpenChange(false);
    } catch (err) {
      logError(err, "Create lab type");
      setServerError(getErrorMessage(err));
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      reset();
      setServerError("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
              <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Шинэ лаб төрөл нэмэх
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Server Error */}
          {serverError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {serverError}
            </div>
          )}

          {/* Type Name Field */}
          <div className="space-y-2.5">
            <Label
              htmlFor="type_name"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Төрлийн нэр
            </Label>
            <div className="relative">
              <Beaker className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="type_name"
                {...register("type_name")}
                placeholder="Усны Сорьц, Агаарын Сорьц гэх мэт"
                className={`pl-10 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                  errors.type_name ? "border-red-300 focus:border-red-400" : ""
                }`}
              />
            </div>
            {errors.type_name && (
              <p className="text-sm text-red-500">{errors.type_name.message}</p>
            )}
          </div>

          {/* Standard Field */}
          <div className="space-y-2.5">
            <Label
              htmlFor="standard"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Стандарт
            </Label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="standard"
                {...register("standard")}
                placeholder="ISO 9308, MNS 5850 гэх мэт"
                className={`pl-10 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                  errors.standard ? "border-red-300 focus:border-red-400" : ""
                }`}
              />
            </div>
            {errors.standard && (
              <p className="text-sm text-red-500">{errors.standard.message}</p>
            )}
          </div>

          <DialogFooter className="pt-5 border-t border-slate-200/60 dark:border-slate-800/60 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Болих
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
