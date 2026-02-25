"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, Key, Lock, Trash2, AlertCircle, Pen } from "lucide-react";
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
import { api, uploadFile, fetchBlob } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage, logError } from "@/lib/errors";
import type { Employee, Roles } from "@/types";

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
  const [roleId, setRoleId] = useState<number | null>(null);
  const [roles, setRoles] = useState<Roles[]>([]);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleSuccess, setRoleSuccess] = useState(false);

  // Password reset
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Signature
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [signatureSuccess, setSignatureSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deactivate
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    api
      .get<Roles[]>(ENDPOINTS.USERS.ROLES)
      .then(setRoles)
      .catch((err) => logError(err, "Fetch roles"));
  }, []);

  const loadEmployeeSignature = async (userId: number) => {
    try {
      const blob = await fetchBlob(ENDPOINTS.USERS.SIGNATURE_BY_ID(userId));
      setSignatureUrl(URL.createObjectURL(blob));
    } catch {
      setSignatureUrl(null);
    }
  };

  useEffect(() => {
    if (open && employee) {
      setEmail(employee.email);
      setRoleId(employee.role_id);
      setNewPassword("");
      setEmailError(null);
      setEmailSuccess(false);
      setRoleError(null);
      setRoleSuccess(false);
      setPasswordError(null);
      setPasswordSuccess(false);
      setSignatureError(null);
      setSignatureSuccess(null);
      loadEmployeeSignature(employee.id);
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
        role_id: roleId,
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

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employee) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setSignatureError("Зөвхөн PNG, JPG зураг оруулна уу");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSignatureError("Файлын хэмжээ 2MB-с хэтэрсэн байна");
      return;
    }

    try {
      setSignatureError(null);
      setSignatureSuccess(null);
      setSignatureUploading(true);
      const formData = new FormData();
      formData.append("signature", file);
      await uploadFile(ENDPOINTS.USERS.SIGNATURE_BY_ID(employee.id), formData);
      setSignatureSuccess("Гарын үсэг амжилттай хадгалагдлаа");
      await loadEmployeeSignature(employee.id);
    } catch (err) {
      logError(err, "Upload employee signature");
      setSignatureError(getErrorMessage(err));
    } finally {
      setSignatureUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSignatureDelete = async () => {
    if (!employee) return;
    try {
      setSignatureError(null);
      setSignatureSuccess(null);
      setSignatureUploading(true);
      await api.delete(ENDPOINTS.USERS.SIGNATURE_BY_ID(employee.id));
      setSignatureUrl(null);
      setSignatureSuccess("Гарын үсэг амжилттай устгагдлаа");
    } catch (err) {
      logError(err, "Delete employee signature");
      setSignatureError(getErrorMessage(err));
    } finally {
      setSignatureUploading(false);
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
              <Select
                value={roleId ? String(roleId) : undefined}
                onValueChange={(v) => {
                  setRoleId(Number(v));
                  setRoleSuccess(false);
                }}
              >
                <SelectTrigger className="pl-8 bg-slate-50 border-slate-200">
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
              disabled={roleSaving || roleId === employee.role_id}
              className="text-xs"
            >
              {roleSaving ? "Хадгалж байна..." : "Эрх хадгалах"}
            </Button>
          </div>

          <Separator />

          {/* Password Reset Section */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">
              Нууц үг шинэчлэх
            </Label>
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

          {/* Signature Section */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-1.5">
              <Pen className="h-3.5 w-3.5 text-slate-400" />
              Гарын үсэг
            </Label>
            {signatureUrl ? (
              <div className="space-y-2">
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex items-center justify-center">
                  <img
                    src={signatureUrl}
                    alt="Гарын үсэг"
                    className="max-h-16 object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={signatureUploading}
                  >
                    Солих
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      if (window.confirm("Гарын үсгийг устгахдаа итгэлтэй байна уу?")) {
                        handleSignatureDelete();
                      }
                    }}
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
                className="text-xs"
                onClick={() => fileInputRef.current?.click()}
                disabled={signatureUploading}
              >
                {signatureUploading ? "Хадгалж байна..." : "Зураг оруулах"}
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleSignatureUpload}
            />
            <p className="text-xs text-muted-foreground">PNG эсвэл JPG. Цагаан дэвсгэр автоматаар арилна.</p>
            {signatureError && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {signatureError}
              </div>
            )}
            {signatureSuccess && (
              <div className="rounded-lg bg-green-50 border border-green-100 p-2 text-sm text-green-600">
                {signatureSuccess}
              </div>
            )}
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
                    {employee.email} хэрэглэгчийг идэвхгүй болговол системд
                    нэвтрэх боломжгүй болно.
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
