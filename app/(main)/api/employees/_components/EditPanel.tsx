"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  X,
  Mail,
  Key,
  Lock,
  Trash2,
} from "lucide-react";
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
import { EmployeeCard } from "./EmployeeCard";

const ROLE_OPTIONS = [
  { value: "engineer", label: "Инженер" },
  { value: "senior_engineer", label: "Ахлах инженер" },
  { value: "admin", label: "Админ" },
  { value: "superadmin", label: "Супер админ" },
];

interface EditPanelProps {
  employee: Employee | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function EditPanel({ employee, onClose, onSaved }: EditPanelProps) {
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setEditEmail(employee.email);
      setEditRole(employee.role_name);
      setEditPassword("");
      setError(null);
      setSuccess(null);
    }
  }, [employee]);

  const handleUpdateEmail = async () => {
    if (!employee || !editEmail.trim()) return;
    try {
      setError(null);
      setSuccess(null);
      setSaving(true);
      await api.put(ENDPOINTS.USERS.UPDATE(employee.id), {
        email: editEmail.trim(),
      });
      setSuccess("Имэйл хадгалагдлаа");
      onSaved?.();
    } catch (err) {
      logError(err, "Update email");
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!employee) return;
    try {
      setError(null);
      setSuccess(null);
      setSaving(true);
      await api.put(ENDPOINTS.USERS.CHANGE_ROLE(employee.id), {
        role_name: editRole,
      });
      setSuccess("Эрх солигдлоо");
      onSaved?.();
    } catch (err) {
      logError(err, "Change role");
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!employee || !editPassword) {
      setError("Нууц үг оруулна уу");
      return;
    }
    try {
      setError(null);
      setSuccess(null);
      setSaving(true);
      await api.put(ENDPOINTS.USERS.RESET_PASSWORD(employee.id), {
        new_password: editPassword,
      });
      setSuccess("Нууц үг шинэчлэгдлээ");
      setEditPassword("");
    } catch (err) {
      logError(err, "Reset password");
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!employee) return;
    try {
      await api.delete(ENDPOINTS.USERS.DEACTIVATE(employee.id));
      onClose();
      onSaved?.();
    } catch (err) {
      logError(err, "Deactivate user");
    }
  };

  return (
    <AnimatePresence>
      {employee && (
        <motion.div
          key="edit-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="shrink-0 border-l border-slate-200 bg-white overflow-hidden"
        >
          <div className="w-[380px] h-full overflow-y-auto">
            <div className="p-5 space-y-4">
              {/* Panel header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-800">
                  Мэдээлэл засах
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Employee info */}
              <div className="rounded-lg bg-slate-50 p-3">
                <EmployeeCard employee={employee} compact />
              </div>

              {/* Feedback */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-2 text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-green-50 border border-green-100 p-2 text-xs text-green-600">
                  {success}
                </div>
              )}

              <Separator />

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 font-medium">
                  Имэйл
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="email"
                    className="pl-8 h-9 text-sm bg-slate-50 border-slate-200"
                    value={editEmail}
                    onChange={(e) => {
                      setEditEmail(e.target.value);
                      setSuccess(null);
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs w-full"
                  onClick={handleUpdateEmail}
                  disabled={saving || editEmail === employee.email}
                >
                  {saving ? "..." : "Имэйл хадгалах"}
                </Button>
              </div>

              <Separator />

              {/* Role */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 font-medium">
                  Эрх
                </Label>
                <div className="relative">
                  <Key className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 z-10" />
                  <Select
                    value={editRole}
                    onValueChange={(v) => {
                      setEditRole(v);
                      setSuccess(null);
                    }}
                  >
                    <SelectTrigger className="pl-8 h-9 text-sm bg-slate-50 border-slate-200">
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
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs w-full"
                  onClick={handleUpdateRole}
                  disabled={saving || editRole === employee.role_name}
                >
                  {saving ? "..." : "Эрх хадгалах"}
                </Button>
              </div>

              <Separator />

              {/* Password reset */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 font-medium">
                  Нууц үг шинэчлэх
                </Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="password"
                    className="pl-8 h-9 text-sm bg-slate-50 border-slate-200"
                    placeholder="Шинэ нууц үг"
                    value={editPassword}
                    onChange={(e) => {
                      setEditPassword(e.target.value);
                      setSuccess(null);
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs w-full"
                  onClick={handleResetPassword}
                  disabled={saving || !editPassword}
                >
                  {saving ? "..." : "Нууц үг шинэчлэх"}
                </Button>
              </div>

              <Separator />

              {/* Deactivate */}
              <div className="space-y-2">
                <Label className="text-xs text-red-500 font-medium">
                  Аюултай бүс
                </Label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs w-full text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                    >
                      <Trash2 className="h-3 w-3" />
                      {employee.is_active
                        ? "Идэвхгүй болгох"
                        : "Аль хэдийн идэвхгүй"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Ажилтныг идэвхгүй болгох уу?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {employee.email} хэрэглэгчийг идэвхгүй болговол
                        системд нэвтрэх боломжгүй болно.
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
