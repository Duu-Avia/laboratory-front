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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage, logError } from "@/lib/errors";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number | null;
  onRejected: () => void;
}

export function RejectDialog({
  open,
  onOpenChange,
  reportId,
  onRejected,
}: RejectDialogProps) {
  const [password, setPassword] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reportId) return;
    if (!comment.trim()) {
      setError("Буцаах шалтгаан оруулна уу");
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
        ENDPOINTS.REPORTS.REJECT(reportId),
        { password, comment },
        {
          skipAuthRedirect: true,
        }
      );
      setPassword("");
      setComment("");
      onOpenChange(false);
      onRejected();
    } catch (err) {
      logError(err, "Reject report");
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setPassword("");
      setComment("");
      setError(null);
    }
    onOpenChange(value);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Тайлан буцаах</AlertDialogTitle>
          <AlertDialogDescription>
            Тайланг буцаахын тулд шалтгаанаа бичиж, нууц үгээ оруулна уу.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reject-comment">Буцаах шалтгаан</Label>
            <Textarea
              id="reject-comment"
              placeholder="Шалтгаанаа бичнэ үү..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reject-password">Нууц үг</Label>
            <Input
              id="reject-password"
              type="password"
              placeholder="Нууц үг"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReject();
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
            onClick={(e) => {
              e.preventDefault();
              handleReject();
            }}
            disabled={loading || !password.trim() || !comment.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? "Буцааж байна..." : "Буцаах"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
