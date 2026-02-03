"use client";

import { useState } from "react";
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

const ROLE_OPTIONS = [
  { value: "engineer", label: "Инженер" },
  { value: "senior_engineer", label: "Ахлах инженер" },
  { value: "admin", label: "Админ" },
  { value: "superadmin", label: "Супер админ" },
];

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labTypes: LabType[];
  defaultLabTypeId?: number;
  isSuperAdmin?: boolean;
  onCreated?: () => void;
}

export function CreateEmployeeDialog({
  open,
  onOpenChange,
  labTypes,
  defaultLabTypeId,
  isSuperAdmin,
  onCreated,
}: CreateEmployeeDialogProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState("engineer");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labTypeName = labTypes.find((lt) => lt.id === defaultLabTypeId)?.type_name;

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setEmail("");
      setPassword("");
      setRoleName("engineer");
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleSave = async () => {
    if (!email.trim()) {
      setError("Имэйл оруулна уу");
      return;
    }
    if (!password) {
      setError("Нууц үг оруулна уу");
      return;
    }
    if (!defaultLabTypeId) {
      setError("Лаб төрөл тодорхойгүй байна");
      return;
    }

    try {
      setError(null);
      setSaving(true);

      const roles =  await api.get(ENDPOINTS.USERS.ROLES)
      .then((data)=> setRoleName(""))

      const created = await api.post<{ id: number }>(ENDPOINTS.USERS.CREATE, {
        email: email.trim(),
        full_name: fullName.trim(),
        password,
        role_name: isSuperAdmin ? roleName : "engineer",
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
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0 border-slate-200 shadow-xl sm:rounded-xl">
        <DialogHeader className="p-6 pb-2 bg-slate-50/50">
          <DialogTitle className="text-lg font-bold text-slate-900">
            {isSuperAdmin ? "Шинэ ажилтан нэмэх" : "Шинэ инженер нэмэх"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Шинэ хэрэглэгчийн мэдээллийг оруулан бүртгэнэ үү.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Имэйл хаяг</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@lab.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Нууц үг</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="password"
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Хочоо хэл</Label>
            <div className="relative">
              <UserPen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Түмэнд түгээх нэр"
              />
            </div>
          </div>

          {isSuperAdmin && (
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Эрх</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400 z-10" />
                <Select value={roleName} onValueChange={setRoleName}>
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
            </div>
          )}

          {labTypeName && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm">
              <span className="text-slate-500">Лаб төрөл: </span>
              <span className="font-semibold text-slate-800">{labTypeName}</span>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-2 bg-slate-50/50 gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="hover:bg-slate-100"
          >
            Болих
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                 Уншиж байна...
              </span>
            ) : "Нэмэх"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}