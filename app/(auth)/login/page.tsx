"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, Loader2 } from "lucide-react";
import { loginValidation, type LoginForm } from "@/lib/validators";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginValidation),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(
          json.detail || json.message || "Нэвтрэхэд алдаа гарлаа"
        );
        return;
      }

      const token = json.access_token || json.token;
      if (token) {
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        localStorage.setItem("token", token);
      }

      router.push("/");
      router.refresh();
    } catch {
      setServerError("Нэвтрэхэд алдаа гарлаа");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 mb-4">
            <FlaskConical className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Лаборатори
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Системд нэвтрэх
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Нэвтрэх email
              </Label>
              <Input
                id="email"
                type="text"
                {...register("email")}
                placeholder="Нэвтрэх email"
                className={`h-11 border-slate-200 dark:border-slate-800 focus:border-blue-300 focus:ring-blue-200 ${
                  errors.email
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : ""
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Нууц үг
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Нууц үг"
                className={`h-11 border-slate-200 dark:border-slate-800 focus:border-blue-300 focus:ring-blue-200 ${
                  errors.password
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : ""
                }`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Нэвтэрч байна...
                </>
              ) : (
                "Нэвтрэх"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
