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

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number | null;
  onApproved: () => void;
}

export function ApproveDialog({
  open,
  onOpenChange,
  reportId,
  onApproved,
}: ApproveDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!reportId) return;
    if (!password.trim()) {
      setError("Нууц үг оруулна уу");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await api.put(ENDPOINTS.REPORTS.APPROVE(reportId), { password });
      setPassword("");
      onOpenChange(false);
      onApproved();
    } catch (err) {
      logError(err, "Approve report");
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
          <AlertDialogTitle>Тайлан батлах</AlertDialogTitle>
          <AlertDialogDescription>
            Тайланг батлахын тулд нууц үгээ оруулна уу. Баталсны дараа тайлан
            дээр таны гарын үсэг бүртгэгдэнэ.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="approve-password">Нууц үг</Label>
          <Input
            id="approve-password"
            type="password"
            placeholder="Нууц үг"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApprove();
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
            onClick={handleApprove}
            disabled={loading || !password.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Батлаж байна..." : "Батлах"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
