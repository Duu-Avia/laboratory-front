"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Mail, Lock, Key, UserPen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage, logError } from "@/lib/errors";
import type { LabType } from "@/types";
import { Roles } from "@/types/user";
import {
  employeeValidation,
  type EmployeeForm,
} from "@/lib/validators";

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Roles[];
  labTypes: LabType[];
  defaultLabTypeId?: number;
  isSuperAdmin?: boolean;
  onCreated?: () => void;
}

export function CreateEmployeeDialog({
  open,
  onOpenChange,
  roles,
  labTypes,
  defaultLabTypeId,
  isSuperAdmin,
  onCreated,
}: CreateEmployeeDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeValidation),
    defaultValues: { email: "", password: "", fullName: "", roleId: 0 },
  });

  const roleId = watch("roleId");

  const labTypeName = labTypes.find(
    (lt) => lt.id === defaultLabTypeId
  )?.type_name;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset();
      setServerError(null);
    }
  }, [open, reset]);

  const onSubmit = async (data: EmployeeForm) => {
    if (!defaultLabTypeId) {
      setServerError("Лаб төрөл тодорхойгүй байна");
      return;
    }

    try {
      setServerError(null);

      const engineerRole = roles.find((r) => r.role_name === "engineer");
      const selectedRoleId =
        isSuperAdmin && data.roleId ? data.roleId : engineerRole?.id;

      const created = await api.post<{ id: number }>(ENDPOINTS.USERS.CREATE, {
        email: data.email.trim(),
        full_name: data.fullName?.trim() ?? "",
        password: data.password,
        role_id: selectedRoleId,
        lab_type_ids: [defaultLabTypeId],
      });

      if (created?.id) {
        await api.post(ENDPOINTS.USERS.ASSIGN_LAB_TYPES(created.id), {
          lab_type_ids: [defaultLabTypeId],
        });
      }

      onCreated?.();
      onOpenChange(false);
    } catch (err) {
      logError(err, "Create employee");
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0 border-slate-200 shadow-xl sm:rounded-xl">
        <DialogHeader className="p-6 pb-2 bg-slate-50/50">
          <DialogTitle className="text-lg font-bold text-slate-900">
            {isSuperAdmin ? "Шинэ ажилтан нэмэх" : "Шинэ инженер нэмэх"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Шинэ хэрэглэгчийн мэдээллийг оруулан бүртгэнэ үү.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          <div className="p-6 space-y-5">
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Имэйл хаяг</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  className={`pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors ${
                    errors.email ? "border-red-300 focus:border-red-400" : ""
                  }`}
                  {...register("email")}
                  placeholder="engineer@lab.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Нууц үг</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  className={`pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors ${
                    errors.password ? "border-red-300 focus:border-red-400" : ""
                  }`}
                  {...register("password")}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Хочоо хэл</Label>
              <div className="relative">
                <UserPen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  {...register("fullName")}
                  placeholder="Түмэнд түгээх нэр"
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {isSuperAdmin && (
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Эрх</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400 z-10" />
                  <Select
                    value={roleId ? roleId.toString() : ""}
                    onValueChange={(val) => setValue("roleId", Number(val))}
                  >
                    <SelectTrigger className="pl-8 bg-slate-50 border-slate-200 ">
                      <SelectValue placeholder="Эрх сонгоно уу" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.role_name}
                        
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.roleId && (
                    <p className="text-sm text-red-500">
                      {errors.roleId.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {labTypeName && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm">
                <span className="text-slate-500">Лаб төрөл: </span>
                <span className="font-semibold text-slate-800">
                  {labTypeName}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-2 bg-slate-50/50 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="hover:bg-slate-100"
            >
              Болих
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  Уншиж байна...
                </span>
              ) : (
                "Нэмэх"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
