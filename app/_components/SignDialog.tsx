"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage, logError } from "@/lib/errors";

interface SignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number | null;
  onSigned: () => void;
}

export function SignDialog({
  open,
  onOpenChange,
  reportId,
  onSigned,
}: SignDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    if (!reportId) return;
    if (!password.trim()) {
      setError("Нууц үг оруулна уу");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await api.put(ENDPOINTS.REPORTS.SIGN(reportId), { password });
      setPassword("");
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
            Шинжилгээний тайланд гарын үсэг зурахын тулд нууц үгээ оруулна уу.
            Гарын үсэг зурсны дараа тайлан баталгаажуулалтад илгээгдэнэ.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
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

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Болих</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSign}
            disabled={loading || !password.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {loading ? "Гарын үсэг зурж байна..." : "Гарын үсэг зурах"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
