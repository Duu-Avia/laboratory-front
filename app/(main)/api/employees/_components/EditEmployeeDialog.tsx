"use client";

import { useEffect, useState } from "react";
import { Mail, Key, Lock, Trash2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import type { Employee } from "@/types";

const ROLE_OPTIONS = [
  { value: "engineer", label: "Инженер" },
  { value: "senior_engineer", label: "Ахлах инженер" },
  { value: "admin", label: "Админ" },
  { value: "superadmin", label: "Супер админ" },
];

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onUpdated?: () => void;
}

export function EditEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onUpdated,
}: EditEmployeeDialogProps) {
  // Email edit
  const [email, setEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Role edit
  const [role, setRole] = useState("");
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleSuccess, setRoleSuccess] = useState(false);

  // Password reset
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Deactivate
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    if (open && employee) {
      setEmail(employee.email);
      setRole(employee.role_name);
      setNewPassword("");
      setEmailError(null);
      setEmailSuccess(false);
      setRoleError(null);
      setRoleSuccess(false);
      setPasswordError(null);
      setPasswordSuccess(false);
    }
  }, [open, employee]);

  if (!employee) return null;

  const handleEmailSave = async () => {
    if (!email.trim()) {
      setEmailError("Имэйл хоосон байна");
      return;
    }
    try {
      setEmailError(null);
      setEmailSuccess(false);
      setEmailSaving(true);
      await api.put(ENDPOINTS.USERS.UPDATE(employee.id), {
        email: email.trim(),
      });
      setEmailSuccess(true);
      onUpdated?.();
    } catch (err) {
      logError(err, "Update employee email");
      setEmailError(getErrorMessage(err));
    } finally {
      setEmailSaving(false);
    }
  };

  const handleRoleSave = async () => {
    try {
      setRoleError(null);
      setRoleSuccess(false);
      setRoleSaving(true);
      await api.put(ENDPOINTS.USERS.CHANGE_ROLE(employee.id), {
        role_name: role,
      });
      setRoleSuccess(true);
      onUpdated?.();
    } catch (err) {
      logError(err, "Change employee role");
      setRoleError(getErrorMessage(err));
    } finally {
      setRoleSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword) {
      setPasswordError("Шинэ нууц үг оруулна уу");
      return;
    }
    try {
      setPasswordError(null);
      setPasswordSuccess(false);
      setPasswordSaving(true);
      await api.put(ENDPOINTS.USERS.RESET_PASSWORD(employee.id), {
        new_password: newPassword,
      });
      setPasswordSuccess(true);
      setNewPassword("");
    } catch (err) {
      logError(err, "Reset employee password");
      setPasswordError(getErrorMessage(err));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setDeactivating(true);
      await api.delete(ENDPOINTS.USERS.DEACTIVATE(employee.id));
      onUpdated?.();
      onOpenChange(false);
    } catch (err) {
      logError(err, "Deactivate employee");
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0 border-slate-200 shadow-xl sm:rounded-xl">
        <DialogHeader className="p-6 pb-3 bg-slate-50/50">
          <DialogTitle className="text-lg font-bold text-slate-900">
            Ажилтны мэдээлэл засах
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {employee.email}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Email Section */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Имэйл хаяг</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailSuccess(false);
                }}
              />
            </div>
            {emailError && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {emailError}
              </div>
            )}
            {emailSuccess && (
              <div className="rounded-lg bg-green-50 border border-green-100 p-2 text-sm text-green-600">
                Амжилттай хадгалагдлаа
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleEmailSave}
              disabled={emailSaving || email === employee.email}
              className="text-xs"
            >
              {emailSaving ? "Хадгалж байна..." : "Имэйл хадгалах"}
            </Button>
          </div>

          <Separator />

          {/* Role Section */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Эрх</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400 z-10" />
              <Select value={role} onValueChange={(v) => { setRole(v); setRoleSuccess(false); }}>
                <SelectTrigger className="pl-8 bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {roleError && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {roleError}
              </div>
            )}
            {roleSuccess && (
              <div className="rounded-lg bg-green-50 border border-green-100 p-2 text-sm text-green-600">
                Эрх амжилттай солигдлоо
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleRoleSave}
              disabled={roleSaving || role === employee.role_name}
              className="text-xs"
            >
              {roleSaving ? "Хадгалж байна..." : "Эрх хадгалах"}
            </Button>
          </div>

          <Separator />

          {/* Password Reset Section */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Нууц үг шинэчлэх</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="password"
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                placeholder="Шинэ нууц үг"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordSuccess(false);
                }}
              />
            </div>
            {passwordError && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-lg bg-green-50 border border-green-100 p-2 text-sm text-green-600">
                Нууц үг амжилттай шинэчлэгдлээ
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handlePasswordReset}
              disabled={passwordSaving || !newPassword}
              className="text-xs"
            >
              {passwordSaving ? "Хадгалж байна..." : "Нууц үг шинэчлэх"}
            </Button>
          </div>

          <Separator />

          {/* Deactivate Section */}
          <div className="space-y-2">
            <Label className="text-red-600 font-medium">Аюултай бүс</Label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5"
                  disabled={deactivating}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {employee.is_active ? "Идэвхгүй болгох" : "Аль хэдийн идэвхгүй"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ажилтныг идэвхгүй болгох уу?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {employee.email} хэрэглэгчийг идэвхгүй болговол системд нэвтрэх боломжгүй болно.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Болих</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeactivate}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Идэвхгүй болгох
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
