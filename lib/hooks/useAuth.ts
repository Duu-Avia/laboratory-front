"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Authentication hook
 * Provides login, logout, and auth state management
 */
export function useAuth() {
  const router = useRouter();

  const logout = useCallback(() => {
    // Clear token from cookie and localStorage\
    document.cookie = "token=; path=/; max-age=0";
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!getToken();
  }, [getToken]);

  return {
    logout,
    getToken,
    isAuthenticated,
  };
}
