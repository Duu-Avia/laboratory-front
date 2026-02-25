"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, X, Mail, Key, Lock, Trash2, Pen } from "lucide-react";
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
import { api, uploadFile, fetchBlob } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage, logError } from "@/lib/errors";
import type { Employee, Roles } from "@/types";
import { EmployeeCard } from "./EmployeeCard";

interface EditPanelProps {
  employee: Employee | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function EditPanel({ employee, onClose, onSaved }: EditPanelProps) {
  const [editEmail, setEditEmail] = useState("");
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [roles, setRoles] = useState<Roles[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Signature
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmAction, setConfirmAction] = useState<"replace" | "delete" | "deactivate" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get<Roles[]>(ENDPOINTS.USERS.ROLES)
      .then(setRoles)
      .catch((err) => logError(err, "Fetch roles"));
  }, []);

  const loadSignature = async (userId: number) => {
    try {
      const blob = await fetchBlob(ENDPOINTS.USERS.SIGNATURE_BY_ID(userId));
      setSignatureUrl(URL.createObjectURL(blob));
    } catch {
      setSignatureUrl(null);
    }
  };

  useEffect(() => {
    if (employee) {
      setEditEmail(employee.email);
      setEditRoleId(employee.role_id);
      setEditPassword("");
      setError(null);
      setSuccess(null);
      setConfirmAction(null);
      loadSignature(employee.id);
    }
  }, [employee]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employee) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Зөвхөн PNG, JPG зураг оруулна уу");
      return;
    }

    setPendingFile(file);
    setConfirmAction("replace");
  };

  const cancelConfirm = () => {
    setConfirmAction(null);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSignatureUpload = async () => {
    if (!pendingFile || !employee) return;
    try {
      setError(null);
      setSuccess(null);
      setSignatureUploading(true);
      const formData = new FormData();
      formData.append("signature", pendingFile);
      await uploadFile(ENDPOINTS.USERS.SIGNATURE_BY_ID(employee.id), formData);
      setSuccess("Гарын үсэг хадгалагдлаа");
      await loadSignature(employee.id);
      setConfirmAction(null);
    } catch (err) {
      logError(err, "Upload signature");
      setError(getErrorMessage(err));
    } finally {
      setSignatureUploading(false);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSignatureDelete = async () => {
    if (!employee) return;
    try {
      setError(null);
      setSuccess(null);
      setSignatureUploading(true);
      await api.delete(ENDPOINTS.USERS.SIGNATURE_BY_ID(employee.id));
      setSignatureUrl(null);
      setSuccess("Гарын үсэг устгагдлаа");
      setConfirmAction(null);
    } catch (err) {
      logError(err, "Delete signature");
      setError(getErrorMessage(err));
    } finally {
      setSignatureUploading(false);
    }
  };

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
        role_id: editRoleId,
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
      await api.put(ENDPOINTS.USERS.DEACTIVATE(employee.id));
      setConfirmAction(null);
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
                    value={editRoleId ? String(editRoleId) : ""}
                    onValueChange={(v) => {
                      setEditRoleId(Number(v));
                      setSuccess(null);
                    }}
                  >
                    <SelectTrigger className="pl-8 h-9 text-sm bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.description || r.role_name}
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
                  disabled={saving || editRoleId === employee.role_id}
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

              {/* Signature */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 font-medium flex items-center gap-1">
                  <Pen className="h-3 w-3 text-slate-400" />
                  Гарын үсэг
                </Label>

                {/* Inline confirmation for replace/delete */}
                {confirmAction === "replace" && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                    <p className="text-xs text-amber-800 font-medium">
                      {signatureUrl ? "Гарын үсэг солих уу?" : "Гарын үсэг хадгалах уу?"}
                    </p>
                    <p className="text-[11px] text-amber-600">
                      {signatureUrl
                        ? "Одоогийн гарын үсгийг шинээр сонгосон зургаар солих гэж байна."
                        : "Сонгосон зургийг гарын үсэг болгон хадгалах уу?"}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1"
                        onClick={cancelConfirm}
                        disabled={signatureUploading}
                      >
                        Болих
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs flex-1"
                        onClick={handleSignatureUpload}
                        disabled={signatureUploading}
                      >
                        {signatureUploading ? "Хадгалж байна..." : "Тийм, хадгалах"}
                      </Button>
                    </div>
                  </div>
                )}

                {confirmAction === "delete" && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
                    <p className="text-xs text-red-800 font-medium">
                      Гарын үсэг устгах уу?
                    </p>
                    <p className="text-[11px] text-red-600">
                      {employee.email} хэрэглэгчийн гарын үсгийг устгахдаа итгэлтэй байна уу?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1"
                        onClick={cancelConfirm}
                        disabled={signatureUploading}
                      >
                        Болих
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs flex-1"
                        onClick={handleSignatureDelete}
                        disabled={signatureUploading}
                      >
                        {signatureUploading ? "Устгаж байна..." : "Тийм, устгах"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Normal signature UI (hidden during confirmation) */}
                {confirmAction !== "replace" && confirmAction !== "delete" && (
                  <>
                    {signatureUrl ? (
                      <div className="space-y-2">
                        <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center justify-center">
                          <img
                            src={signatureUrl}
                            alt="Гарын үсэг"
                            className="max-h-12 object-contain"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs flex-1"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={signatureUploading}
                          >
                            Солих
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs flex-1 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setConfirmAction("delete")}
                            disabled={signatureUploading}
                          >
                            Устгах
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs w-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={signatureUploading}
                      >
                        {signatureUploading ? "..." : "Зураг оруулах"}
                      </Button>
                    )}
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <p className="text-[11px] text-slate-400">
                  PNG эсвэл JPG. Цагаан дэвсгэр автоматаар арилна.
                </p>
              </div>

              <Separator />

              {/* Deactivate */}
              <div className="space-y-2">
                <Label className="text-xs text-red-500 font-medium">
                  Аюултай бүс
                </Label>

                {confirmAction === "deactivate" ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
                    <p className="text-xs text-red-800 font-medium">
                      Ажилтныг идэвхгүй болгох уу?
                    </p>
                    <p className="text-[11px] text-red-600">
                      {employee.email} хэрэглэгчийг идэвхгүй болговол системд
                      нэвтрэх боломжгүй болно.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1"
                        onClick={() => setConfirmAction(null)}
                      >
                        Болих
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs flex-1"
                        onClick={handleDeactivate}
                      >
                        Идэвхгүй болгох
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs w-full text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                    onClick={() => setConfirmAction("deactivate")}
                  >
                    <Trash2 className="h-3 w-3" />
                    {employee.is_active
                      ? "Идэвхгүй болгох"
                      : "Аль хэдийн идэвхгүй"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
