"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { ROUTES } from "@/lib/routes";

/**
 * Authentication hook — provides logout only.
 * For user data, use useUser() from @/lib/hooks/useUser instead.
 */
export function useAuth() {
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // even if the call fails, redirect to login
    }
    router.push(ROUTES.login());
  }, [router]);

  return { logout };
}
