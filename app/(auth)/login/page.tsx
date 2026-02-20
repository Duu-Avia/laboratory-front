"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { loginValidation, type LoginForm } from "@/lib/validators";
import { api, ApiError } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
const loginBg = "/earth.jpg";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      await api.post(ENDPOINTS.AUTH.LOGIN, data, { skipAuthRedirect: true });
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        const d = err.data as Record<string, string> | undefined;
        setServerError(d?.detail || d?.message || "Нэвтрэхэд алдаа гарлаа");
      } else {
        setServerError("Нэвтрэхэд алдаа гарлаа");
      }
    }
  };

  const inputClasses =
    "h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 transition-all duration-200 focus:border-violet-400 focus:ring-violet-400/20";

  return (
    <div className="relative flex min-h-screen">
      {/* Full-screen background */}
      <img
        src={loginBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/6" />
      {/* Left Panel - text overlay on background */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center z-10"
      >
        <div>
          <h1 className="text-white/80 text-lg font-medium tracking-wider uppercase">
            Лабораторийн удирдлагын систем
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Энэхүү системийн зорилго нь сорьц шинжилгээ, шинжилгээний үр дүн
            <br /> тайлан хадгалах, тайлан хянан батлах гэх мэт олон үйлдлийг
            нэг дор нэтгэсэн систем юм
          </p>
        </div>
      </motion.div>

      {/* Right Panel - glass form */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 backdrop-blur-2xl  border-l border-white/3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Logo & Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center">
              <img
                className="w-[50%] h-[50%] pb-5"
                src={"/energy-logo-white.png"}
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Тавтай морил!
            </h1>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Server Error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/20 border border-red-400/30 p-3 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {serverError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70 text-sm">
                Нэвтрэх email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email")}
                className={`${inputClasses} ${errors.email ? "border-red-400/50" : ""}`}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70 text-sm">
                Нууц үг
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`${inputClasses} pr-10 ${errors.password ? "border-red-400/50" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-600/30 transition-all duration-200 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Нэвтэрч байна...
                </>
              ) : (
                "Нэвтрэх"
              )}
            </Button>

            {/* Footer link */}
            <div className="text-center text-sm text-white/50"></div>
          </motion.form>

          {/* Bottom support text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-xs text-white/30"
          >
            Тусламж хэрэгтэй бол админтай холбогдоно уу
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
