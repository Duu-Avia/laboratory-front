"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api, uploadFile, fetchBlob } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage, logError } from "@/lib/errors";
import type { UserProfile } from "@/types";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<(UserProfile & { has_signature?: boolean }) | null>(null);

  // Email edit
  const [email, setEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Signature
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [signatureSuccess, setSignatureSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setEmailError(null);
    setEmailSuccess(false);
    setPasswordError(null);
    setPasswordSuccess(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSignatureError(null);
    setSignatureSuccess(null);

    api
      .get<UserProfile & { has_signature?: boolean }>(ENDPOINTS.USERS.PROFILE)
      .then((data) => {
        setProfile(data);
        setEmail(data.email);
        if (data.has_signature) {
          loadSignaturePreview();
        } else {
          setSignatureUrl(null);
        }
      })
      .catch((err) => {
        logError(err, "Fetch profile");
      })
      .finally(() => setLoading(false));
  }, [open]);

  const loadSignaturePreview = async () => {
    try {
      const blob = await fetchBlob(ENDPOINTS.USERS.SIGNATURE);
      setSignatureUrl(URL.createObjectURL(blob));
    } catch {
      setSignatureUrl(null);
    }
  };

  const handleEmailSave = async () => {
    if (!email.trim()) {
      setEmailError("Имэйл хоосон байна");
      return;
    }
    try {
      setEmailError(null);
      setEmailSuccess(false);
      setEmailSaving(true);
      await api.put(ENDPOINTS.USERS.PROFILE, { email: email.trim() });
      setEmailSuccess(true);
    } catch (err) {
      logError(err, "Update profile");
      setEmailError(getErrorMessage(err));
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!oldPassword) {
      setPasswordError("Хуучин нууц үг оруулна уу");
      return;
    }
    if (!newPassword) {
      setPasswordError("Шинэ нууц үг оруулна уу");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Шинэ нууц үг таарахгүй байна");
      return;
    }
    try {
      setPasswordError(null);
      setPasswordSuccess(false);
      setPasswordSaving(true);
      await api.put(ENDPOINTS.USERS.PROFILE_PASSWORD, {
        current_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      logError(err, "Change password");
      setPasswordError(getErrorMessage(err));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      await uploadFile(ENDPOINTS.USERS.SIGNATURE, formData);
      setSignatureSuccess("Гарын үсэг амжилттай хадгалагдлаа");
      await loadSignaturePreview();
    } catch (err) {
      logError(err, "Upload signature");
      setSignatureError(getErrorMessage(err));
    } finally {
      setSignatureUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSignatureDelete = async () => {
    try {
      setSignatureError(null);
      setSignatureSuccess(null);
      setSignatureUploading(true);
      await api.delete(ENDPOINTS.USERS.SIGNATURE);
      setSignatureUrl(null);
      setSignatureSuccess("Гарын үсэг амжилттай устгагдлаа");
    } catch (err) {
      logError(err, "Delete signature");
      setSignatureError(getErrorMessage(err));
    } finally {
      setSignatureUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Профайл</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Уншиж байна...
          </div>
        ) : (
          <div className="space-y-5">
            {/* Email Section */}
            <div className="space-y-3">
              <Label>Имэйл</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailSuccess(false);
                }}
              />
              {emailError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-600">
                  {emailError}
                </div>
              )}
              {emailSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-2 text-sm text-green-600">
                  Амжилттай хадгалагдлаа
                </div>
              )}
              <Button
                size="sm"
                onClick={handleEmailSave}
                disabled={emailSaving || email === profile?.email}
              >
                {emailSaving ? "Хадгалж байна..." : "Имэйл хадгалах"}
              </Button>
            </div>

            <Separator />

            {/* Signature Section */}
            <div className="space-y-3">
              <Label>Гарын үсэг</Label>
              {signatureUrl ? (
                <div className="space-y-2">
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex items-center justify-center">
                    <img
                      src={signatureUrl}
                      alt="Гарын үсэг"
                      className="max-h-20 object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={signatureUploading}
                    >
                      Солих
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleSignatureDelete}
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
              <p className="text-xs text-muted-foreground">
                PNG эсвэл JPG, 2MB хүртэл. Цагаан дэвсгэр автоматаар арилна.
              </p>
              {signatureError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-600">
                  {signatureError}
                </div>
              )}
              {signatureSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-2 text-sm text-green-600">
                  {signatureSuccess}
                </div>
              )}
            </div>

            <Separator />

            {/* Password Section */}
            <div className="space-y-3">
              <Label>Нууц үг солих</Label>
              <Input
                type="password"
                placeholder="Хуучин нууц үг"
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  setPasswordSuccess(false);
                }}
              />
              <Input
                type="password"
                placeholder="Шинэ нууц үг"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordSuccess(false);
                }}
              />
              <Input
                type="password"
                placeholder="Шинэ нууц үг давтах"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordSuccess(false);
                }}
              />
              {passwordError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-600">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-2 text-sm text-green-600">
                  Нууц үг амжилттай солигдлоо
                </div>
              )}
              <Button
                size="sm"
                onClick={handlePasswordSave}
                disabled={passwordSaving}
              >
                {passwordSaving ? "Хадгалж байна..." : "Нууц үг солих"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
