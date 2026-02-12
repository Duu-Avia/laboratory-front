"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage, logError } from "@/lib/errors";
import type { SeniorEngineer } from "@/types";

interface SignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number | null;
  labTypeId: number | null;
  onSigned: () => void;
}

export function SignDialog({
  open,
  onOpenChange,
  reportId,
  labTypeId,
  onSigned,
}: SignDialogProps) {
  const [password, setPassword] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [seniors, setSeniors] = useState<SeniorEngineer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch senior engineers when dialog opens
  useEffect(() => {
    if (!open || !labTypeId) {
      setSeniors([]);
      setAssignedTo(null);
      return;
    }

    api
      .get<SeniorEngineer[]>(ENDPOINTS.USERS.SENIORS(labTypeId))
      .then((data) => setSeniors(data))
      .catch((err) => {
        logError(err, "Fetch seniors");
        setSeniors([]);
      });
  }, [open, labTypeId]);

  const handleSign = async () => {
    if (!reportId) return;
    if (!assignedTo) {
      setError("Хянах инженер сонгоно уу");
      return;
    }
    if (!password.trim()) {
      setError("Нууц үг оруулна уу");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await api.put(
        ENDPOINTS.REPORTS.SIGN(reportId),
        { password, assigned_to: assignedTo },
        { skipAuthRedirect: true }
      );
      setPassword("");
      setAssignedTo(null);
      onOpenChange(false);
      onSigned();
    } catch (err) {
      logError(err, "Sign report");
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setPassword("");
      setAssignedTo(null);
      setError(null);
    }
    onOpenChange(value);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Тайланд гарын үсэг зурах</AlertDialogTitle>
          <AlertDialogDescription>
            Хянах инженерээ сонгоод, нууц үгээ оруулна уу.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          {/* Senior Engineer Select */}
          <div className="space-y-2">
            <Label>Хянах инженер</Label>
            <Select
              value={assignedTo ? String(assignedTo) : undefined}
              onValueChange={(v) => setAssignedTo(Number(v))}
              disabled={seniors.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    seniors.length === 0
                      ? "Инженер олдсонгүй"
                      : "Инженер сонгох"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {seniors.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="sign-password">Нууц үг</Label>
            <Input
              id="sign-password"
              type="password"
              placeholder="Нууц үг"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSign();
              }}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Болих</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSign}
            disabled={loading || !assignedTo || !password.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {loading ? "Гарын үсэг зурж байна..." : "Гарын үсэг зурах"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
